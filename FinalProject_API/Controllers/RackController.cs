using FinalProject_API.DTOs.Rack;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RackController : ControllerBase
    {
        private readonly IRackRepository _rackRepo;
        private readonly ISectionRepository _sectionRepo;

        public RackController(IRackRepository rackRepo, ISectionRepository sectionRepo)
        {
            _rackRepo = rackRepo;
            _sectionRepo = sectionRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RackResponseDto>>> GetAll()
        {
            var racks = await _rackRepo.GetActiveRacksAsync();
            return Ok(racks.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RackResponseDto>> GetById(int id)
        {
            var rack = await _rackRepo.GetByIdAsync(id);
            if (rack == null) return NotFound();
            return Ok(MapToResponse(rack));
        }

        [HttpGet("bySection/{sectionId}")]
        public async Task<ActionResult<IEnumerable<RackResponseDto>>> GetBySection(int sectionId)
        {
            var racks = await _rackRepo.GetRacksBySectionAsync(sectionId);
            return Ok(racks.Select(MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<RackResponseDto>> Create(RackRequestDto dto)
        {
            var section = await _sectionRepo.GetByIdAsync(dto.SectionId);
            if (section == null) return BadRequest("Section does not exist.");

            if (await _rackRepo.IsDuplicateCodeAsync(dto.RackCode))
                return Conflict($"Rack code '{dto.RackCode}' already exists.");

            var rack = new Rack
            {
                SectionId = dto.SectionId,
                RackCode = dto.RackCode,
                RackName = dto.RackName,
                TotalShelves = dto.TotalShelves,
                DDCRangeStart = dto.DDCRangeStart,
                DDCRangeEnd = dto.DDCRangeEnd
            };
            await _rackRepo.AddAsync(rack);
            await _rackRepo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = rack.RackId }, MapToResponse(rack));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, RackRequestDto dto)
        {
            var rack = await _rackRepo.GetByIdAsync(id);
            if (rack == null) return NotFound();

            var section = await _sectionRepo.GetByIdAsync(dto.SectionId);
            if (section == null) return BadRequest("Section does not exist.");

            if (await _rackRepo.IsDuplicateCodeAsync(dto.RackCode, id))
                return Conflict($"Rack code '{dto.RackCode}' already exists.");

            rack.SectionId = dto.SectionId;
            rack.RackCode = dto.RackCode;
            rack.RackName = dto.RackName;
            rack.TotalShelves = dto.TotalShelves;
            rack.DDCRangeStart = dto.DDCRangeStart;
            rack.DDCRangeEnd = dto.DDCRangeEnd;
            rack.UpdatedDate = DateTime.Now;

            _rackRepo.Update(rack);
            await _rackRepo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var rack = await _rackRepo.GetByIdAsync(id);
            if (rack == null) return NotFound();
            _rackRepo.SoftDelete(rack);
            await _rackRepo.SaveChangesAsync();
            return NoContent();
        }

        private RackResponseDto MapToResponse(Rack rack)
        {
            return new RackResponseDto
            {
                RackId = rack.RackId,
                SectionId = rack.SectionId,
                SectionCode = rack.Section?.SectionCode ?? "",
                FloorCode = rack.Section?.Floor?.FloorCode,
                RackCode = rack.RackCode,
                RackName = rack.RackName,
                TotalShelves = rack.TotalShelves,
                DDCRangeStart = rack.DDCRangeStart,
                DDCRangeEnd = rack.DDCRangeEnd,
                IsActive = rack.IsActive,
                CreatedDate = rack.CreatedDate,
                UpdatedDate = rack.UpdatedDate
            };
        }
    }
}
