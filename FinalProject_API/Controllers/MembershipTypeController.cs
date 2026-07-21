using FinalProject_API.DTOs.MembershipType;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembershipTypeController : ControllerBase
    {
        private readonly IMembershipTypeRepository _repo;

        public MembershipTypeController(IMembershipTypeRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MembershipTypeResponseDto>>> GetAll()
        {
            var types = await _repo.GetActiveTypesAsync();
            return Ok(types.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MembershipTypeResponseDto>> GetById(int id)
        {
            var type = await _repo.GetByIdAsync(id);
            if (type == null) return NotFound();
            return Ok(MapToResponse(type));
        }

        [HttpPost]
        public async Task<ActionResult<MembershipTypeResponseDto>> Create(MembershipTypeRequestDto dto)
        {
            if (await _repo.IsDuplicateNameAsync(dto.Name))
                return Conflict($"Membership type '{dto.Name}' already exists.");

            var entity = new MembershipType
            {
                Name = dto.Name,
                Description = dto.Description,
                MaxBooksCanBorrow = dto.MaxBooksCanBorrow,
                LoanPeriodDays = dto.LoanPeriodDays,
                MaxBooksForInLibraryReading = dto.MaxBooksForInLibraryReading,
                MaxOutstandingFine = dto.MaxOutstandingFine,
                CanBorrowRareBooks = dto.CanBorrowRareBooks,
                YearlyFee = dto.YearlyFee
            };

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.MembershipTypeId }, MapToResponse(entity));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MembershipTypeRequestDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return NotFound();

            if (await _repo.IsDuplicateNameAsync(dto.Name, id))
                return Conflict($"Membership type '{dto.Name}' already exists.");

            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.MaxBooksCanBorrow = dto.MaxBooksCanBorrow;
            entity.LoanPeriodDays = dto.LoanPeriodDays;
            entity.MaxBooksForInLibraryReading = dto.MaxBooksForInLibraryReading;
            entity.CanBorrowRareBooks = dto.CanBorrowRareBooks;
            entity.MaxOutstandingFine = dto.MaxOutstandingFine;
            entity.YearlyFee = dto.YearlyFee;
            entity.UpdatedDate = DateTime.Now;

            _repo.Update(entity);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return NotFound();
            _repo.SoftDelete(entity);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        private MembershipTypeResponseDto MapToResponse(MembershipType entity)
        {
            return new MembershipTypeResponseDto
            {
                MembershipTypeId = entity.MembershipTypeId,
                Name = entity.Name,
                Description = entity.Description,
                MaxBooksCanBorrow = entity.MaxBooksCanBorrow,
                LoanPeriodDays = entity.LoanPeriodDays,
                MaxBooksForInLibraryReading = entity.MaxBooksForInLibraryReading,
                CanBorrowRareBooks = entity.CanBorrowRareBooks,
                YearlyFee = entity.YearlyFee,
                MaxOutstandingFine = entity.MaxOutstandingFine,
                IsActive = entity.IsActive,
                CreatedDate = entity.CreatedDate,
                UpdatedDate = entity.UpdatedDate
            };
        }
    }
}
