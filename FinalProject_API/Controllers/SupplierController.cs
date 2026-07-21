using FinalProject_API.DTOs.Supplier;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierRepository _repo;

        public SupplierController(ISupplierRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierResponseDto>>> GetAll()
        {
            var suppliers = await _repo.GetActiveSuppliersAsync();
            return Ok(suppliers.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierResponseDto>> GetById(int id)
        {
            var supplier = await _repo.GetByIdAsync(id);
            if (supplier == null) return NotFound();
            return Ok(MapToResponse(supplier));
        }

        [HttpPost]
        public async Task<ActionResult<SupplierResponseDto>> Create(SupplierRequestDto dto)
        {
            if (await _repo.IsDuplicateNameAsync(dto.Name))
                return Conflict($"Supplier '{dto.Name}' already exists.");

            var supplier = new Supplier
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };
            await _repo.AddAsync(supplier);
            await _repo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = supplier.SupplierId }, MapToResponse(supplier));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SupplierRequestDto dto)
        {
            var supplier = await _repo.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            if (await _repo.IsDuplicateNameAsync(dto.Name, id))
                return Conflict($"Supplier '{dto.Name}' already exists.");

            supplier.Name = dto.Name;
            supplier.Email = dto.Email;
            supplier.Phone = dto.Phone;
            supplier.Address = dto.Address;
            supplier.UpdatedDate = DateTime.Now;

            _repo.Update(supplier);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _repo.GetByIdAsync(id);
            if (supplier == null) return NotFound();
            _repo.SoftDelete(supplier);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        private SupplierResponseDto MapToResponse(Supplier supplier)
        {
            return new SupplierResponseDto
            {
                SupplierId = supplier.SupplierId,
                Name = supplier.Name,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                IsActive = supplier.IsActive,
                CreatedDate = supplier.CreatedDate,
                UpdatedDate = supplier.UpdatedDate
            };
        }
    }
}
