using FinalProject_API.DTOs.PurchaseOrder;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderRepository _orderRepo;
        private readonly IBookEditionRepository _editionRepo;
        private readonly IPhysicalCopyRepository _copyRepo;
        private readonly ISupplierRepository _supplierRepo;
        private readonly IShelfRepository _shelfRepo;

        public PurchaseOrderController(
            IPurchaseOrderRepository orderRepo,
            IBookEditionRepository editionRepo,
            IPhysicalCopyRepository copyRepo,
            ISupplierRepository supplierRepo,
            IShelfRepository shelfRepo)
        {
            _orderRepo = orderRepo;
            _editionRepo = editionRepo;
            _copyRepo = copyRepo;
            _supplierRepo = supplierRepo;
            _shelfRepo = shelfRepo;
        }

        // GET: api/PurchaseOrder
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrderResponseDto>>> GetAll()
        {
            var orders = await _orderRepo.GetAllWithItemsAsync();
            return Ok(orders.Select(MapToResponse));
        }

        // GET: api/PurchaseOrder/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> GetById(int id)
        {
            var order = await _orderRepo.GetOrderWithItemsAsync(id);
            if (order == null) return NotFound();
            return Ok(MapToResponse(order));
        }

        // POST: api/PurchaseOrder (create new PO – status: PendingApproval)
        [HttpPost]
        public async Task<ActionResult<PurchaseOrderResponseDto>> Create(PurchaseOrderRequestDto dto)
        {
            if (!dto.Items.Any())
                return BadRequest("At least one order item is required.");

            if (dto.ReceiveDate < dto.OrderDate)
                return BadRequest("Receive date must be on or after the order date.");

            // Validate supplier
            var supplier = await _supplierRepo.GetByIdAsync(dto.SupplierId);
            if (supplier == null) return BadRequest("Invalid SupplierId.");

            // Validate all editions
            foreach (var item in dto.Items)
            {
                var ed = await _editionRepo.GetByIdAsync(item.BookEditionId);
                if (ed == null)
                    return BadRequest($"BookEdition ID {item.BookEditionId} not found.");
            }

            // Auto‑generate PO number
            string poNumber = await GeneratePONumberAsync(dto.OrderDate);

            var order = new PurchaseOrder
            {
                PO_Number = poNumber,
                SupplierId = dto.SupplierId,
                OrderDate = dto.OrderDate,
                ReceiveDate = dto.ReceiveDate,
                Status = "PendingApproval",
                Notes = dto.Notes,
                AdditionalCharge = dto.AdditionalCharge,
                Items = dto.Items.Select(i => new PurchaseOrderItem
                {
                    BookEditionId = i.BookEditionId,
                    Quantity = i.Quantity,
                    UnitCost = i.UnitCost,
                    ReceivedQuantity = 0
                }).ToList()
            };

            await _orderRepo.AddAsync(order);
            await _orderRepo.SaveChangesAsync();

            var created = await _orderRepo.GetOrderWithItemsAsync(order.PurchaseOrderId);
            return CreatedAtAction(nameof(GetById), new { id = order.PurchaseOrderId }, MapToResponse(created!));
        }

        // POST: api/PurchaseOrder/{id}/approve
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var order = await _orderRepo.GetByIdAsync(id);
            if (order == null) return NotFound();
            if (order.Status != "PendingApproval")
                return BadRequest($"Order is already '{order.Status}', cannot be approved.");

            order.Status = "Approved";
            order.ApprovedDate = DateTime.Now;
            order.UpdatedDate = DateTime.Now;

            _orderRepo.Update(order);
            await _orderRepo.SaveChangesAsync();

            return Ok(new { message = $"Order {order.PO_Number} approved." });
        }

        // POST: api/PurchaseOrder/{id}/receive (partial/full receive)
        [HttpPost("{id}/receive")]
        public async Task<IActionResult> Receive(int id, ReceiveOrderDto dto)
        {
            var order = await _orderRepo.GetOrderWithItemsAsync(id);
            if (order == null) return NotFound();
            if (order.Status != "Approved" && order.Status != "PartiallyReceived")
                return BadRequest($"Order status '{order.Status}' does not allow receiving.");

            if (dto.ReceiveDate < order.OrderDate)
                return BadRequest("Receive date cannot be earlier than order date.");

            if (!dto.Items.Any())
                return BadRequest("No items to receive.");

            foreach (var receiveLine in dto.Items)
            {
                var orderItem = order.Items.FirstOrDefault(oi => oi.PurchaseOrderItemId == receiveLine.PurchaseOrderItemId);
                if (orderItem == null)
                    return BadRequest($"PurchaseOrderItem ID {receiveLine.PurchaseOrderItemId} not found in this order.");

                int remaining = orderItem.Quantity - orderItem.ReceivedQuantity;
                if (receiveLine.Quantity <= 0 || receiveLine.Quantity > remaining)
                    return BadRequest($"Invalid quantity for item '{orderItem.BookEdition?.Book?.Title}'. Remaining: {remaining}, requested: {receiveLine.Quantity}");

                if (receiveLine.ShelfId <= 0)
                    return BadRequest($"ShelfId is required for item {receiveLine.PurchaseOrderItemId}.");

                var shelf = await _shelfRepo.GetByIdAsync(receiveLine.ShelfId);
                if (shelf == null)
                    return BadRequest($"Shelf ID {receiveLine.ShelfId} not found.");

                int occupied = await _copyRepo.GetOccupiedCountOnShelfAsync(receiveLine.ShelfId);
                if (occupied + receiveLine.Quantity > shelf.MaxCapacity)
                    return BadRequest($"Shelf '{shelf.ShelfCode}' does not have enough capacity. Available: {shelf.MaxCapacity - occupied}, requested: {receiveLine.Quantity}");
            }

            // All validations passed; create copies and update received quantities
            foreach (var receiveLine in dto.Items)
            {
                var orderItem = order.Items.First(oi => oi.PurchaseOrderItemId == receiveLine.PurchaseOrderItemId);
                var edition = await _editionRepo.GetByIdAsync(orderItem.BookEditionId);

                string baseCode = edition?.Book?.BaseLibraryCode ?? "LIB";
                int nextSerial = await _copyRepo.GetNextCopySerialNumberAsync(baseCode);
                int nextPosition = await _copyRepo.GetNextPositionOnShelfAsync(receiveLine.ShelfId);

                for (int i = 0; i < receiveLine.Quantity; i++)
                {
                    var copy = new PhysicalCopy
                    {
                        BookEditionId = orderItem.BookEditionId,
                        BaseLibraryCode = baseCode,
                        CopySerialNumber = nextSerial + i,
                        Barcode = $"{baseCode}-{(nextSerial + i):D3}",
                        ShelfId = receiveLine.ShelfId,
                        PositionOnShelf = nextPosition + i,
                        Status = "Available",
                        CurrentCondition = "New",
                        AcquiredDate = DateTime.Now,
                        AcquiredCost = orderItem.UnitCost,
                        SupplierId = order.SupplierId,
                        PurchaseInvoice = order.PO_Number
                    };
                    await _copyRepo.AddAsync(copy);
                }

                orderItem.ReceivedQuantity += receiveLine.Quantity;
            }

            // Update order status
            bool allFullyReceived = order.Items.All(oi => oi.ReceivedQuantity >= oi.Quantity);
            order.Status = allFullyReceived ? "Completed" : "PartiallyReceived";
            order.UpdatedDate = DateTime.Now;

            _orderRepo.Update(order);
            await _orderRepo.SaveChangesAsync();

            return Ok(new { message = $"Received successfully. Order status: {order.Status}." });
        }

        // DELETE: api/PurchaseOrder/{id} (cancel if PendingApproval only)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var order = await _orderRepo.GetByIdAsync(id);
            if (order == null) return NotFound();
            if (order.Status != "PendingApproval")
                return BadRequest($"Only pending approval orders can be cancelled. Current status: {order.Status}.");

            order.Status = "Cancelled";
            order.UpdatedDate = DateTime.Now;
            _orderRepo.Update(order);
            await _orderRepo.SaveChangesAsync();
            return NoContent();
        }

        // Helper: generate PO number
        private async Task<string> GeneratePONumberAsync(DateTime orderDate)
        {
            // Example: PO-2026-0001
            string year = orderDate.Year.ToString();
            // Get the latest PO number for that year from the database
            var lastPO = (await _orderRepo.FindAsync(po => po.PO_Number.StartsWith($"PO-{year}-")))
                             .OrderByDescending(po => po.PO_Number)
                             .FirstOrDefault();
            int nextSeq = 1;
            if (lastPO != null)
            {
                string lastSeqStr = lastPO.PO_Number.Substring($"PO-{year}-".Length);
                if (int.TryParse(lastSeqStr, out int lastSeq))
                    nextSeq = lastSeq + 1;
            }
            return $"PO-{year}-{nextSeq:D4}";
        }

        // Helper mapping
        private PurchaseOrderResponseDto MapToResponse(PurchaseOrder order)
        {
            return new PurchaseOrderResponseDto
            {
                PurchaseOrderId = order.PurchaseOrderId,
                PO_Number = order.PO_Number,
                SupplierId = order.SupplierId,
                SupplierName = order.Supplier?.Name,
                OrderDate = order.OrderDate,
                ReceiveDate = order.ReceiveDate,
                Status = order.Status,
                AdditionalCharge = order.AdditionalCharge,
                ApprovedDate = order.ApprovedDate,
                Notes = order.Notes,
                IsActive = order.IsActive,
                CreatedDate = order.CreatedDate,
                UpdatedDate = order.UpdatedDate,
                Items = order.Items.Select(i => new PurchaseOrderItemResponseDto
                {
                    PurchaseOrderItemId = i.PurchaseOrderItemId,
                    BookEditionId = i.BookEditionId,
                    BookTitle = i.BookEdition?.Book?.Title,
                    Edition = i.BookEdition?.Edition,
                    OrderedQuantity = i.Quantity,
                    ReceivedQuantity = i.ReceivedQuantity,
                    RemainingQuantity = i.Quantity - i.ReceivedQuantity,
                    UnitCost = i.UnitCost
                }).ToList()
            };
        }
    }
}
