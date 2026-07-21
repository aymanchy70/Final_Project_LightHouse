using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IItemCategoryRepository : IGenericRepository<ItemCategory>
    {
        Task<IEnumerable<ItemCategory>> GetActiveCategoriesAsync();
        Task<ItemCategory?> GetByNameAsync(string name);
        Task<bool> IsDuplicateAsync(string name, int? excludeId = null);
    }
}
