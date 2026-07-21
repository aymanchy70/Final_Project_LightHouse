using FinalProject_API.DTOs.ItemCategory;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ItemCategoryController : ControllerBase
    {
        private readonly IItemCategoryRepository _categoryRepo;

        public ItemCategoryController(IItemCategoryRepository categoryRepo)
        {
            _categoryRepo = categoryRepo;
        }

        // GET: api/ItemCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemCategoryResponseDto>>> GetCategories()
        {
            var categories = await _categoryRepo.GetAllAsync();

            var response = categories.Select(c => new ItemCategoryResponseDto
            {
                ItemCategoryId = c.ItemCategoryId,
                CategoryName = c.CategoryName,
                CategoryDescription = c.CategoryDescription,
                IsActive = c.IsActive,
                CreatedDate = c.CreatedDate,
                UpdatedDate = c.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/ItemCategory/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ItemCategoryResponseDto>>> GetActiveCategories()
        {
            var categories = await _categoryRepo.GetActiveCategoriesAsync();

            var response = categories.Select(c => new ItemCategoryResponseDto
            {
                ItemCategoryId = c.ItemCategoryId,
                CategoryName = c.CategoryName,
                CategoryDescription = c.CategoryDescription,
                IsActive = c.IsActive,
                CreatedDate = c.CreatedDate,
                UpdatedDate = c.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/ItemCategory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemCategoryResponseDto>> GetCategory(int id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);

            if (category == null)
                return NotFound($"Category with ID {id} not found.");

            var response = new ItemCategoryResponseDto
            {
                ItemCategoryId = category.ItemCategoryId,
                CategoryName = category.CategoryName,
                CategoryDescription = category.CategoryDescription,
                IsActive = category.IsActive,
                CreatedDate = category.CreatedDate,
                UpdatedDate = category.UpdatedDate
            };

            return Ok(response);
        }

        // POST: api/ItemCategory
        [HttpPost]
        public async Task<ActionResult<ItemCategoryResponseDto>> CreateCategory(ItemCategoryRequestDto request)
        {
            // Check for duplicate name
            if (await _categoryRepo.IsDuplicateAsync(request.CategoryName))
                return Conflict($"A category with the name '{request.CategoryName}' already exists.");

            var category = new ItemCategory
            {
                CategoryName = request.CategoryName,
                CategoryDescription = request.CategoryDescription,
                // IsActive defaults to true from BaseEntity
                // CreatedDate set in BaseEntity
            };

            await _categoryRepo.AddAsync(category);
            await _categoryRepo.SaveChangesAsync();

            var response = new ItemCategoryResponseDto
            {
                ItemCategoryId = category.ItemCategoryId,
                CategoryName = category.CategoryName,
                CategoryDescription = category.CategoryDescription,
                IsActive = category.IsActive,
                CreatedDate = category.CreatedDate,
                UpdatedDate = category.UpdatedDate
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.ItemCategoryId }, response);
        }

        // PUT: api/ItemCategory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, ItemCategoryRequestDto request)
        {
            var existingCategory = await _categoryRepo.GetByIdAsync(id);
            if (existingCategory == null)
                return NotFound($"Category with ID {id} not found.");

            // Check for duplicate name (excluding current category)
            if (await _categoryRepo.IsDuplicateAsync(request.CategoryName, id))
                return Conflict($"A category with the name '{request.CategoryName}' already exists.");

            // Update properties
            existingCategory.CategoryName = request.CategoryName;
            existingCategory.CategoryDescription = request.CategoryDescription;
            existingCategory.UpdatedDate = DateTime.Now;

            _categoryRepo.Update(existingCategory);
            await _categoryRepo.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ItemCategory/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null)
                return NotFound($"Category with ID {id} not found.");

            _categoryRepo.SoftDelete(category);
            await _categoryRepo.SaveChangesAsync();

            return NoContent();
        }
    }

}
