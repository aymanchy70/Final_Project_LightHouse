using FinalProject_API.DTOs.Floor;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FloorController : ControllerBase
    {
        private readonly IFloorRepository _repo;

        public FloorController(IFloorRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FloorResponseDto>>> GetAll()
        {
            var floors = await _repo.GetActiveFloorsAsync();
            return Ok(floors.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FloorResponseDto>> GetById(int id)
        {
            var floor = await _repo.GetByIdAsync(id);
            if (floor == null) return NotFound();
            return Ok(MapToResponse(floor));
        }

        [HttpPost]
        public async Task<ActionResult<FloorResponseDto>> Create(FloorRequestDto dto)
        {
            if (await _repo.IsDuplicateCodeAsync(dto.FloorCode))
                return Conflict($"Floor code '{dto.FloorCode}' already exists.");

            var floor = new Floor
            {
                FloorCode = dto.FloorCode,
                FloorName = dto.FloorName,
                Description = dto.Description
            };
            await _repo.AddAsync(floor);
            await _repo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = floor.FloorId }, MapToResponse(floor));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FloorRequestDto dto)
        {
            var floor = await _repo.GetByIdAsync(id);
            if (floor == null) return NotFound();

            if (await _repo.IsDuplicateCodeAsync(dto.FloorCode, id))
                return Conflict($"Floor code '{dto.FloorCode}' already exists.");

            floor.FloorCode = dto.FloorCode;
            floor.FloorName = dto.FloorName;
            floor.Description = dto.Description;
            floor.UpdatedDate = DateTime.Now;

            _repo.Update(floor);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var floor = await _repo.GetByIdAsync(id);
            if (floor == null) return NotFound();
            _repo.SoftDelete(floor);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        private FloorResponseDto MapToResponse(Floor floor)
        {
            return new FloorResponseDto
            {
                FloorId = floor.FloorId,
                FloorCode = floor.FloorCode,
                FloorName = floor.FloorName,
                Description = floor.Description,
                IsActive = floor.IsActive,
                CreatedDate = floor.CreatedDate,
                UpdatedDate = floor.UpdatedDate
            };
        }


        [HttpGet("tree")]
        public async Task<ActionResult<IEnumerable<FloorTreeResponseDto>>> GetLocationTree()
        {
            var floors = await _repo.GetFullLocationTreeAsync();
            var result = floors.Select(f => new FloorTreeResponseDto
            {
                FloorId = f.FloorId,
                FloorCode = f.FloorCode,
                FloorName = f.FloorName,
                Sections = f.Sections.Select(s => new SectionTreeDto
                {
                    SectionId = s.SectionId,
                    SectionCode = s.SectionCode,
                    SectionName = s.SectionName,
                    Racks = s.Racks.Select(r => new RackTreeDto
                    {
                        RackId = r.RackId,
                        RackCode = r.RackCode,
                        RackName = r.RackName,
                        Shelves = r.Shelves.Select(sh => new ShelfTreeDto
                        {
                            ShelfId = sh.ShelfId,
                            ShelfCode = sh.ShelfCode,
                            ShelfLevel = sh.ShelfLevel,
                            MaxCapacity = sh.MaxCapacity
                        }).ToList()
                    }).ToList()
                }).ToList()
            });

            return Ok(result);
        }
    }
}
