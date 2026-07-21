using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class SubCategoryRepository : GenericRepository<SubCategory>, ISubCategoryRepository
    {
        public SubCategoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SubCategory>> GetActiveSubCategoriesAsync()
        {
            return await _dbSet
                .Where(sc => sc.IsActive)
                .Include(sc => sc.ItemCategory)
                .OrderBy(sc => sc.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<SubCategory>> GetSubCategoriesByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(sc => sc.CategoryId == categoryId && sc.IsActive)
                .OrderBy(sc => sc.Name)
                .ToListAsync();
        }

        public async Task<SubCategory?> GetByNameAndCategoryAsync(string name, int categoryId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(sc => sc.Name == name && sc.CategoryId == categoryId && sc.IsActive);
        }

        public async Task<bool> IsDuplicateAsync(string name, int categoryId, int? excludeId = null)
        {
            var query = _dbSet.Where(sc => sc.Name == name && sc.CategoryId == categoryId && sc.IsActive);
            if (excludeId.HasValue)
                query = query.Where(sc => sc.SubCategoryId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
