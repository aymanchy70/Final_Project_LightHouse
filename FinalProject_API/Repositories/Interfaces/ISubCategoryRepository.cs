using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface ISubCategoryRepository : IGenericRepository<SubCategory>
    {
        Task<IEnumerable<SubCategory>> GetActiveSubCategoriesAsync();
        Task<IEnumerable<SubCategory>> GetSubCategoriesByCategoryAsync(int categoryId);
        Task<SubCategory?> GetByNameAndCategoryAsync(string name, int categoryId);
        Task<bool> IsDuplicateAsync(string name, int categoryId, int? excludeId = null);
    }
}
