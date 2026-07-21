using FinalProject_API.DTOs.Shelf;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShelfController : ControllerBase
    {
        private readonly IShelfRepository _shelfRepo;
        private readonly IRackRepository _rackRepo;

        public ShelfController(IShelfRepository shelfRepo, IRackRepository rackRepo)
        {
            _shelfRepo = shelfRepo;
            _rackRepo = rackRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShelfResponseDto>>> GetAll()
        {
            var shelves = await _shelfRepo.GetActiveShelvesAsync();
            return Ok(shelves.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShelfResponseDto>> GetById(int id)
        {
            var shelf = await _shelfRepo.GetByIdAsync(id);
            if (shelf == null) return NotFound();
            return Ok(MapToResponse(shelf));
        }

        [HttpGet("byRack/{rackId}")]
        public async Task<ActionResult<IEnumerable<ShelfResponseDto>>> GetByRack(int rackId)
        {
            var shelves = await _shelfRepo.GetShelvesByRackAsync(rackId);
            return Ok(shelves.Select(MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<ShelfResponseDto>> Create(ShelfRequestDto dto)
        {
            var rack = await _rackRepo.GetByIdAsync(dto.RackId);
            if (rack == null) return BadRequest("Rack does not exist.");

            if (await _shelfRepo.IsDuplicateCodeAsync(dto.ShelfCode))
                return Conflict($"Shelf code '{dto.ShelfCode}' already exists.");

            var shelf = new Shelf
            {
                RackId = dto.RackId,
                ShelfCode = dto.ShelfCode,
                ShelfLevel = dto.ShelfLevel,
                ShelfLabel = dto.ShelfLabel,
                MaxCapacity = dto.MaxCapacity,
                DDCRangeStart = dto.DDCRangeStart,
                DDCRangeEnd = dto.DDCRangeEnd
            };
            await _shelfRepo.AddAsync(shelf);
            await _shelfRepo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = shelf.ShelfId }, MapToResponse(shelf));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ShelfRequestDto dto)
        {
            var shelf = await _shelfRepo.GetByIdAsync(id);
            if (shelf == null) return NotFound();

            var rack = await _rackRepo.GetByIdAsync(dto.RackId);
            if (rack == null) return BadRequest("Rack does not exist.");

            if (await _shelfRepo.IsDuplicateCodeAsync(dto.ShelfCode, id))
                return Conflict($"Shelf code '{dto.ShelfCode}' already exists.");

            shelf.RackId = dto.RackId;
            shelf.ShelfCode = dto.ShelfCode;
            shelf.ShelfLevel = dto.ShelfLevel;
            shelf.ShelfLabel = dto.ShelfLabel;
            shelf.MaxCapacity = dto.MaxCapacity;
            shelf.DDCRangeStart = dto.DDCRangeStart;
            shelf.DDCRangeEnd = dto.DDCRangeEnd;
            shelf.UpdatedDate = DateTime.Now;

            _shelfRepo.Update(shelf);
            await _shelfRepo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var shelf = await _shelfRepo.GetByIdAsync(id);
            if (shelf == null) return NotFound();
            _shelfRepo.SoftDelete(shelf);
            await _shelfRepo.SaveChangesAsync();
            return NoContent();
        }

        private ShelfResponseDto MapToResponse(Shelf shelf)
        {
            return new ShelfResponseDto
            {
                ShelfId = shelf.ShelfId,
                RackId = shelf.RackId,
                RackCode = shelf.Rack?.RackCode ?? "",
                SectionCode = shelf.Rack?.Section?.SectionCode,
                FloorCode = shelf.Rack?.Section?.Floor?.FloorCode,
                ShelfCode = shelf.ShelfCode,
                ShelfLevel = shelf.ShelfLevel,
                ShelfLabel = shelf.ShelfLabel,
                MaxCapacity = shelf.MaxCapacity,
                DDCRangeStart = shelf.DDCRangeStart,
                DDCRangeEnd = shelf.DDCRangeEnd,
                IsActive = shelf.IsActive,
                CreatedDate = shelf.CreatedDate,
                UpdatedDate = shelf.UpdatedDate
            };
        }
    }
}
