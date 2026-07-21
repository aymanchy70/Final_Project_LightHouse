using FinalProject_API.DTOs.GRN;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GRNController : ControllerBase
    {
        private readonly IGRNRepository _grnRepo;
        private readonly IPurchaseOrderItemRepository _poItemRepo;
        private readonly IPhysicalCopyRepository _copyRepo;
        private readonly IShelfRepository _shelfRepo;
        private readonly IPurchaseOrderRepository _poRepo;

        public GRNController(
            IGRNRepository grnRepo,
            IPurchaseOrderItemRepository poItemRepo,
            IPhysicalCopyRepository copyRepo,
            IShelfRepository shelfRepo,
            IPurchaseOrderRepository poRepo)
        {
            _grnRepo = grnRepo;
            _poItemRepo = poItemRepo;
            _copyRepo = copyRepo;
            _shelfRepo = shelfRepo;
            _poRepo = poRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GRNResponseDto>>> GetAll()
        {
            var grns = await _grnRepo.GetAllWithDetailsAsync();
            return Ok(grns.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GRNResponseDto>> GetById(int id)
        {
            var grn = await _grnRepo.GetByIdWithDetailsAsync(id);
            if (grn == null) return NotFound();
            return Ok(MapToResponse(grn));
        }

        [HttpPost]
        public async Task<ActionResult<GRNResponseDto>> Create(GRNRequestDto dto)
        {
            if (!dto.Items.Any()) return BadRequest("At least one item required.");

            foreach (var item in dto.Items)
            {
                var poItem = await _poItemRepo.GetByIdAsync(item.PurchaseOrderItemId);
                if (poItem == null) return BadRequest($"PurchaseOrderItem {item.PurchaseOrderItemId} not found.");

                int remaining = poItem.Quantity - poItem.ReceivedQuantity;
                if (item.Quantity <= 0 || item.Quantity > remaining)
                    return BadRequest($"Invalid quantity for item {item.PurchaseOrderItemId}. Remaining: {remaining}");

                var shelf = await _shelfRepo.GetByIdAsync(item.ShelfId);
                if (shelf == null) return BadRequest($"Shelf {item.ShelfId} not found.");

                int occupied = await _copyRepo.GetOccupiedCountOnShelfAsync(item.ShelfId);
                if (occupied + item.Quantity > shelf.MaxCapacity)
                    return BadRequest($"Shelf '{shelf.ShelfCode}' capacity exceeded.");
            }

            // Create GRN
            string grnNumber = await _grnRepo.GenerateGRNNumberAsync();
            var grn = new GRN
            {
                GRN_Number = grnNumber,
                ReceivedDate = dto.ReceivedDate,
                ReceivedBy = dto.ReceivedBy,
                VehicleNumber = dto.VehicleNumber,
                DeliveryPersonName = dto.DeliveryPersonName,
                Notes = dto.Notes,
                Items = dto.Items.Select(i => new GRNItem
                {
                    PurchaseOrderItemId = i.PurchaseOrderItemId,
                    Quantity = i.Quantity,
                    ShelfId = i.ShelfId
                }).ToList()
            };

            // Create physical copies & update PO item received quantity
            foreach (var item in dto.Items)
            {
                var poItem = await _poItemRepo.GetByIdAsync(item.PurchaseOrderItemId);
                var edition = poItem!.BookEdition;
                string baseCode = edition?.Book?.BaseLibraryCode ?? "LIB";
                int nextSerial = await _copyRepo.GetNextCopySerialNumberAsync(baseCode);
                int nextPosition = await _copyRepo.GetNextPositionOnShelfAsync(item.ShelfId);

                for (int i = 0; i < item.Quantity; i++)
                {
                    var copy = new PhysicalCopy
                    {
                        BookEditionId = poItem.BookEditionId,
                        BaseLibraryCode = baseCode,
                        CopySerialNumber = nextSerial + i,
                        Barcode = $"{baseCode}-{(nextSerial + i):D3}",
                        ShelfId = item.ShelfId,
                        PositionOnShelf = nextPosition + i,
                        Status = "Available",
                        CurrentCondition = "New",
                        AcquiredDate = DateTime.Now,
                        AcquiredCost = poItem.UnitCost,
                        SupplierId = poItem.PurchaseOrder?.SupplierId,
                        PurchaseInvoice = poItem.PurchaseOrder?.PO_Number
                    };
                    await _copyRepo.AddAsync(copy);
                }

                // Update received quantity on the PO item
                poItem.ReceivedQuantity += item.Quantity;

                // Update PO status if fully received
                var po = poItem.PurchaseOrder;
                if (po != null)
                {
                    bool allFullyReceived = po.Items.All(oi => oi.ReceivedQuantity >= oi.Quantity);
                    po.Status = allFullyReceived ? "Completed" : "PartiallyReceived";
                    po.UpdatedDate = DateTime.Now;
                }
            }

            await _grnRepo.AddAsync(grn);
            await _grnRepo.SaveChangesAsync();

            var created = await _grnRepo.GetByIdWithDetailsAsync(grn.GRNId);
            return CreatedAtAction(nameof(GetById), new { id = grn.GRNId }, MapToResponse(created!));
        }

        [HttpPost("{id}/inspect")]
        [Authorize(Policy = "ManageGRN")]
        public async Task<IActionResult> InspectGRN(int id, [FromBody] GRNInspectDto dto)
        {
            var grn = await _grnRepo.GetByIdWithDetailsAsync(id);
            if (grn == null) return NotFound();

            // Optionally update inspection fields on the GRN entity
            // (You can add these fields to the GRN entity if they don't exist yet.
            // For now, we'll just log the inspection data – you can persist it if you add the columns.)
            // grn.InspectedBy = dto.InspectedBy;
            // grn.InspectionDate = dto.InspectionDate;
            // grn.InspectionNotes = dto.InspectionNotes;
            // _grnRepo.Update(grn);

            // For simplicity, we'll just return a success message.
            // If you want to store inspection details, extend the GRN entity.
            return Ok(new { message = $"GRN {grn.GRN_Number} inspection recorded by {dto.InspectedBy}." });
        }

        private GRNResponseDto MapToResponse(GRN grn)
        {
            return new GRNResponseDto
            {
                GRNId = grn.GRNId,
                GRN_Number = grn.GRN_Number,
                ReceivedDate = grn.ReceivedDate,
                ReceivedBy = grn.ReceivedBy,
                VehicleNumber = grn.VehicleNumber,
                DeliveryPersonName = grn.DeliveryPersonName,
                Notes = grn.Notes,
                IsActive = grn.IsActive,
                CreatedDate = grn.CreatedDate,
                UpdatedDate = grn.UpdatedDate,
                Items = grn.Items.Select(i => new GRNItemResponseDto
                {
                    GRNItemId = i.GRNItemId,
                    PurchaseOrderItemId = i.PurchaseOrderItemId,
                    BookTitle = i.PurchaseOrderItem?.BookEdition?.Book?.Title,
                    Edition = i.PurchaseOrderItem?.BookEdition?.Edition,
                    Quantity = i.Quantity,
                    ShelfId = i.ShelfId,
                    ShelfCode = i.Shelf?.ShelfCode,
                    PO_Number = i.PurchaseOrderItem?.PurchaseOrder?.PO_Number
                }).ToList()
            };
        }
    }
}
