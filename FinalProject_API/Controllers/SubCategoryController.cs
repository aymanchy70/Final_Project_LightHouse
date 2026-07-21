using FinalProject_API.DTOs.SubCategory;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubCategoryController : ControllerBase
    {
        private readonly ISubCategoryRepository _subCategoryRepo;
        private readonly IItemCategoryRepository _categoryRepo; // For validation

        public SubCategoryController(
            ISubCategoryRepository subCategoryRepo,
            IItemCategoryRepository categoryRepo)
        {
            _subCategoryRepo = subCategoryRepo;
            _categoryRepo = categoryRepo;
        }

        // GET: api/SubCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubCategoryResponseDto>>> GetSubCategories()
        {
            var subCategories = await _subCategoryRepo.GetAllAsync();

            var response = subCategories.Select(sc => new SubCategoryResponseDto
            {
                SubCategoryId = sc.SubCategoryId,
                Name = sc.Name,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = sc.ItemCategory?.CategoryName,
                IsActive = sc.IsActive,
                CreatedDate = sc.CreatedDate,
                UpdatedDate = sc.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/SubCategory/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<SubCategoryResponseDto>>> GetActiveSubCategories()
        {
            var subCategories = await _subCategoryRepo.GetActiveSubCategoriesAsync();

            var response = subCategories.Select(sc => new SubCategoryResponseDto
            {
                SubCategoryId = sc.SubCategoryId,
                Name = sc.Name,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = sc.ItemCategory?.CategoryName,
                IsActive = sc.IsActive,
                CreatedDate = sc.CreatedDate,
                UpdatedDate = sc.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/SubCategory/byCategory/5
        [HttpGet("byCategory/{categoryId}")]
        public async Task<ActionResult<IEnumerable<SubCategoryResponseDto>>> GetSubCategoriesByCategory(int categoryId)
        {
            // Verify category exists
            var category = await _categoryRepo.GetByIdAsync(categoryId);
            if (category == null)
                return NotFound($"Category with ID {categoryId} not found.");

            var subCategories = await _subCategoryRepo.GetSubCategoriesByCategoryAsync(categoryId);

            var response = subCategories.Select(sc => new SubCategoryResponseDto
            {
                SubCategoryId = sc.SubCategoryId,
                Name = sc.Name,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = category.CategoryName,
                IsActive = sc.IsActive,
                CreatedDate = sc.CreatedDate,
                UpdatedDate = sc.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/SubCategory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SubCategoryResponseDto>> GetSubCategory(int id)
        {
            var subCategory = await _subCategoryRepo.GetByIdAsync(id);

            if (subCategory == null)
                return NotFound($"SubCategory with ID {id} not found.");

            // Load parent category name if not already included
            var category = await _categoryRepo.GetByIdAsync(subCategory.CategoryId);

            var response = new SubCategoryResponseDto
            {
                SubCategoryId = subCategory.SubCategoryId,
                Name = subCategory.Name,
                Description = subCategory.Description,
                CategoryId = subCategory.CategoryId,
                CategoryName = category?.CategoryName,
                IsActive = subCategory.IsActive,
                CreatedDate = subCategory.CreatedDate,
                UpdatedDate = subCategory.UpdatedDate
            };

            return Ok(response);
        }

        // POST: api/SubCategory
        [HttpPost]
        public async Task<ActionResult<SubCategoryResponseDto>> CreateSubCategory(SubCategoryRequestDto request)
        {
            // Validate parent category exists
            var category = await _categoryRepo.GetByIdAsync(request.CategoryId);
            if (category == null)
                return BadRequest($"Category with ID {request.CategoryId} does not exist.");

            // Check for duplicate name within same category
            if (await _subCategoryRepo.IsDuplicateAsync(request.Name, request.CategoryId))
                return Conflict($"A subcategory with the name '{request.Name}' already exists in this category.");

            var subCategory = new SubCategory
            {
                Name = request.Name,
                Description = request.Description,
                CategoryId = request.CategoryId
                // IsActive defaults to true from BaseEntity
            };

            await _subCategoryRepo.AddAsync(subCategory);
            await _subCategoryRepo.SaveChangesAsync();

            var response = new SubCategoryResponseDto
            {
                SubCategoryId = subCategory.SubCategoryId,
                Name = subCategory.Name,
                Description = subCategory.Description,
                CategoryId = subCategory.CategoryId,
                CategoryName = category.CategoryName,
                IsActive = subCategory.IsActive,
                CreatedDate = subCategory.CreatedDate,
                UpdatedDate = subCategory.UpdatedDate
            };

            return CreatedAtAction(nameof(GetSubCategory), new { id = subCategory.SubCategoryId }, response);
        }

        // PUT: api/SubCategory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubCategory(int id, SubCategoryRequestDto request)
        {
            var existingSubCategory = await _subCategoryRepo.GetByIdAsync(id);
            if (existingSubCategory == null)
                return NotFound($"SubCategory with ID {id} not found.");

            // Validate parent category if changed
            if (request.CategoryId != existingSubCategory.CategoryId)
            {
                var newCategory = await _categoryRepo.GetByIdAsync(request.CategoryId);
                if (newCategory == null)
                    return BadRequest($"Category with ID {request.CategoryId} does not exist.");
            }

            // Check for duplicate name (excluding current subcategory)
            if (await _subCategoryRepo.IsDuplicateAsync(request.Name, request.CategoryId, id))
                return Conflict($"A subcategory with the name '{request.Name}' already exists in this category.");

            // Update properties
            existingSubCategory.Name = request.Name;
            existingSubCategory.Description = request.Description;
            existingSubCategory.CategoryId = request.CategoryId;
            existingSubCategory.UpdatedDate = DateTime.Now;

            _subCategoryRepo.Update(existingSubCategory);
            await _subCategoryRepo.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/SubCategory/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {
            var subCategory = await _subCategoryRepo.GetByIdAsync(id);
            if (subCategory == null)
                return NotFound($"SubCategory with ID {id} not found.");

            _subCategoryRepo.SoftDelete(subCategory);
            await _subCategoryRepo.SaveChangesAsync();

            return NoContent();
        }
    }
}
