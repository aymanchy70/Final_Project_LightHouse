using FinalProject_API.DTOs.Section;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController : ControllerBase
    {
        private readonly ISectionRepository _sectionRepo;
        private readonly IFloorRepository _floorRepo;

        public SectionController(ISectionRepository sectionRepo, IFloorRepository floorRepo)
        {
            _sectionRepo = sectionRepo;
            _floorRepo = floorRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SectionResponseDto>>> GetAll()
        {
            var sections = await _sectionRepo.GetActiveSectionsAsync();
            return Ok(sections.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SectionResponseDto>> GetById(int id)
        {
            var section = await _sectionRepo.GetByIdAsync(id);
            if (section == null) return NotFound();
            return Ok(MapToResponse(section));
        }

        [HttpGet("byFloor/{floorId}")]
        public async Task<ActionResult<IEnumerable<SectionResponseDto>>> GetByFloor(int floorId)
        {
            var sections = await _sectionRepo.GetSectionsByFloorAsync(floorId);
            return Ok(sections.Select(MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<SectionResponseDto>> Create(SectionRequestDto dto)
        {
            var floor = await _floorRepo.GetByIdAsync(dto.FloorId);
            if (floor == null) return BadRequest("Floor does not exist.");

            if (await _sectionRepo.IsDuplicateCodeAsync(dto.SectionCode))
                return Conflict($"Section code '{dto.SectionCode}' already exists.");

            var section = new Section
            {
                FloorId = dto.FloorId,
                SectionCode = dto.SectionCode,
                SectionName = dto.SectionName,
                DDCRangeStart = dto.DDCRangeStart,
                DDCRangeEnd = dto.DDCRangeEnd,
                IsSpecial = dto.IsSpecial
            };
            await _sectionRepo.AddAsync(section);
            await _sectionRepo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = section.SectionId }, MapToResponse(section));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SectionRequestDto dto)
        {
            var section = await _sectionRepo.GetByIdAsync(id);
            if (section == null) return NotFound();

            var floor = await _floorRepo.GetByIdAsync(dto.FloorId);
            if (floor == null) return BadRequest("Floor does not exist.");

            if (await _sectionRepo.IsDuplicateCodeAsync(dto.SectionCode, id))
                return Conflict($"Section code '{dto.SectionCode}' already exists.");

            section.FloorId = dto.FloorId;
            section.SectionCode = dto.SectionCode;
            section.SectionName = dto.SectionName;
            section.DDCRangeStart = dto.DDCRangeStart;
            section.DDCRangeEnd = dto.DDCRangeEnd;
            section.IsSpecial = dto.IsSpecial;
            section.UpdatedDate = DateTime.Now;

            _sectionRepo.Update(section);
            await _sectionRepo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var section = await _sectionRepo.GetByIdAsync(id);
            if (section == null) return NotFound();
            _sectionRepo.SoftDelete(section);
            await _sectionRepo.SaveChangesAsync();
            return NoContent();
        }

        private SectionResponseDto MapToResponse(Section section)
        {
            return new SectionResponseDto
            {
                SectionId = section.SectionId,
                FloorId = section.FloorId,
                FloorCode = section.Floor?.FloorCode ?? "",
                SectionCode = section.SectionCode,
                SectionName = section.SectionName,
                DDCRangeStart = section.DDCRangeStart,
                DDCRangeEnd = section.DDCRangeEnd,
                IsSpecial = section.IsSpecial,
                IsActive = section.IsActive,
                CreatedDate = section.CreatedDate,
                UpdatedDate = section.UpdatedDate
            };
        }
    }
}
