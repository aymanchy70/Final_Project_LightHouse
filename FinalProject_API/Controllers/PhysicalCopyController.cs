using FinalProject_API.DTOs.PhysicalCopy;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhysicalCopyController : ControllerBase
    {
        private readonly IPhysicalCopyRepository _copyRepo;
        private readonly IBookEditionRepository _editionRepo;
        private readonly IShelfRepository _shelfRepo;

        public PhysicalCopyController(
            IPhysicalCopyRepository copyRepo,
            IBookEditionRepository editionRepo,
            IShelfRepository shelfRepo)
        {
            _copyRepo = copyRepo;
            _editionRepo = editionRepo;
            _shelfRepo = shelfRepo;
        }

        // GET: api/PhysicalCopy
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhysicalCopyResponseDto>>> GetAll()
        {
            var copies = await _copyRepo.GetActiveCopiesAsync();
            return Ok(copies.Select(MapToResponse));
        }

        // GET: api/PhysicalCopy/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PhysicalCopyResponseDto>> GetById(int id)
        {
            var copy = await _copyRepo.GetCopyWithDetailsAsync(id);
            if (copy == null) return NotFound();
            return Ok(MapToResponse(copy));
        }

        // GET: api/PhysicalCopy/byEdition/{editionId}
        [HttpGet("byEdition/{editionId}")]
        public async Task<ActionResult<IEnumerable<PhysicalCopyResponseDto>>> GetByEdition(int editionId)
        {
            var copies = await _copyRepo.GetCopiesByEditionAsync(editionId);
            return Ok(copies.Select(MapToResponse));
        }

        // POST: api/PhysicalCopy (single manual creation)
        [HttpPost]
        public async Task<ActionResult<PhysicalCopyResponseDto>> CreateSingle(PhysicalCopyRequestDto dto)
        {
            var edition = await _editionRepo.GetByIdAsync(dto.BookEditionId);
            if (edition == null) return BadRequest("BookEdition not found.");

            if (dto.ShelfId.HasValue)
            {
                var shelf = await _shelfRepo.GetByIdAsync(dto.ShelfId.Value);
                if (shelf == null) return BadRequest("Shelf not found.");

                var occupied = await _copyRepo.GetOccupiedCountOnShelfAsync(dto.ShelfId.Value);
                if (occupied >= shelf.MaxCapacity)
                    return BadRequest("Shelf is full.");
            }

            string baseCode = string.IsNullOrWhiteSpace(dto.BaseLibraryCode)
                ? (edition.Book?.BaseLibraryCode ?? "LIB")
                : dto.BaseLibraryCode;

            int serial = await _copyRepo.GetNextCopySerialNumberAsync(baseCode);
            int? position = null;
            if (dto.ShelfId.HasValue)
                position = await _copyRepo.GetNextPositionOnShelfAsync(dto.ShelfId.Value);

            var copy = new PhysicalCopy
            {
                BookEditionId = dto.BookEditionId,
                BaseLibraryCode = baseCode,
                CopySerialNumber = serial,
                Barcode = string.IsNullOrWhiteSpace(dto.Barcode)
                    ? $"{baseCode}-{serial:D3}"
                    : dto.Barcode,
                ShelfId = dto.ShelfId,
                PositionOnShelf = position,
                Status = dto.Status ?? "Available",
                CurrentCondition = dto.CurrentCondition,
                AcquiredDate = dto.AcquiredDate ?? DateTime.Now,
                AcquiredCost = dto.AcquiredCost,
                SupplierId = dto.SupplierId,
                PurchaseInvoice = dto.PurchaseInvoice,
                IsReference = dto.IsReference,
                Notes = dto.Notes
            };

            await _copyRepo.AddAsync(copy);
            await _copyRepo.SaveChangesAsync();

            var created = await _copyRepo.GetCopyWithDetailsAsync(copy.PhysicalCopyId);
            return CreatedAtAction(nameof(GetById), new { id = copy.PhysicalCopyId }, MapToResponse(created!));
        }

        // POST: api/PhysicalCopy/shelve (bulk shelve)
        [HttpPost("shelve")]
        public async Task<IActionResult> BulkShelve(BulkShelveRequestDto dto)
        {
            if (!dto.CopyIds.Any())
                return BadRequest("No copy IDs provided.");

            var shelf = await _shelfRepo.GetByIdAsync(dto.ShelfId);
            if (shelf == null)
                return BadRequest("Shelf not found.");

            var copiesToShelve = (await _copyRepo.FindAsync(pc => dto.CopyIds.Contains(pc.PhysicalCopyId))).ToList();
            if (copiesToShelve.Count != dto.CopyIds.Count)
            {
                var missingIds = dto.CopyIds.Except(copiesToShelve.Select(c => c.PhysicalCopyId));
                return BadRequest($"The following copy IDs do not exist: {string.Join(", ", missingIds)}");
            }

            int additionalCopies = copiesToShelve.Count(pc => pc.ShelfId != dto.ShelfId);
            int currentOccupied = await _copyRepo.GetOccupiedCountOnShelfAsync(dto.ShelfId);
            if (currentOccupied + additionalCopies > shelf.MaxCapacity)
            {
                int availableSpots = shelf.MaxCapacity - currentOccupied;
                return BadRequest($"Shelf capacity exceeded. Available spots: {availableSpots}, additional copies: {additionalCopies}");
            }

            int startPosition = await _copyRepo.GetMaxPositionOnShelfExcludingAsync(dto.ShelfId, dto.CopyIds) + 1;

            int position = startPosition;
            foreach (var copy in copiesToShelve)
            {
                copy.ShelfId = dto.ShelfId;
                copy.PositionOnShelf = position++;
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            await _copyRepo.SaveChangesAsync();
            return Ok(new { message = $"{copiesToShelve.Count} copies shelved on '{shelf.ShelfCode}'." });
        }

        // PUT: api/PhysicalCopy/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSingle(int id, PhysicalCopyRequestDto dto)
        {
            var copy = await _copyRepo.GetByIdAsync(id);
            if (copy == null) return NotFound();

            var edition = await _editionRepo.GetByIdAsync(dto.BookEditionId);
            if (edition == null) return BadRequest("BookEdition not found.");

            if (dto.ShelfId.HasValue)
            {
                var shelf = await _shelfRepo.GetByIdAsync(dto.ShelfId.Value);
                if (shelf == null) return BadRequest("Shelf not found.");

                if (dto.ShelfId != copy.ShelfId)
                {
                    var occupied = await _copyRepo.GetOccupiedCountOnShelfAsync(dto.ShelfId.Value);
                    if (occupied >= shelf.MaxCapacity)
                        return BadRequest("Target shelf is full.");
                }
            }

            copy.BookEditionId = dto.BookEditionId;
            copy.BaseLibraryCode = dto.BaseLibraryCode;
            copy.Barcode = dto.Barcode;
            copy.ShelfId = dto.ShelfId;
            if (dto.ShelfId.HasValue && dto.ShelfId != copy.ShelfId)
                copy.PositionOnShelf = await _copyRepo.GetNextPositionOnShelfAsync(dto.ShelfId.Value);
            else if (!dto.ShelfId.HasValue)
                copy.PositionOnShelf = null;

            copy.Status = dto.Status ?? "Available";
            copy.CurrentCondition = dto.CurrentCondition;
            copy.AcquiredDate = dto.AcquiredDate;
            copy.AcquiredCost = dto.AcquiredCost;
            copy.SupplierId = dto.SupplierId;
            copy.PurchaseInvoice = dto.PurchaseInvoice;
            copy.IsReference = dto.IsReference;
            copy.Notes = dto.Notes;
            copy.UpdatedDate = DateTime.Now;

            _copyRepo.Update(copy);
            await _copyRepo.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/PhysicalCopy/{id} (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var copy = await _copyRepo.GetByIdAsync(id);
            if (copy == null) return NotFound();
            _copyRepo.SoftDelete(copy);
            await _copyRepo.SaveChangesAsync();
            return NoContent();
        }

        private PhysicalCopyResponseDto MapToResponse(PhysicalCopy pc)
        {
            return new PhysicalCopyResponseDto
            {
                PhysicalCopyId = pc.PhysicalCopyId,
                BookEditionId = pc.BookEditionId,
                EditionInfo = pc.BookEdition?.Edition ?? "",
                BookTitle = pc.BookEdition?.Book?.Title,
                BaseLibraryCode = pc.BaseLibraryCode,
                CopySerialNumber = pc.CopySerialNumber,
                FullLibraryCode = pc.FullLibraryCode,
                Barcode = pc.Barcode,
                ShelfId = pc.ShelfId,
                ShelfCode = pc.Shelf?.ShelfCode,
                PositionOnShelf = pc.PositionOnShelf,
                Status = pc.Status,
                CurrentCondition = pc.CurrentCondition,
                AcquiredDate = pc.AcquiredDate,
                AcquiredCost = pc.AcquiredCost,
                SupplierId = pc.SupplierId,
                SupplierName = pc.Supplier?.Name,
                PurchaseInvoice = pc.PurchaseInvoice,
                IsReference = pc.IsReference,
                Notes = pc.Notes,
                IsActive = pc.IsActive,
                CreatedDate = pc.CreatedDate,
                UpdatedDate = pc.UpdatedDate
            };
        }
    }
}
