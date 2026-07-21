using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface ISupplierRepository : IGenericRepository<Supplier>
    {
        Task<IEnumerable<Supplier>> GetActiveSuppliersAsync();
        Task<Supplier?> GetByNameAsync(string name);
        Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null);
    }
}
