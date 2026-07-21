using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IShelfRepository : IGenericRepository<Shelf>
    {
        Task<IEnumerable<Shelf>> GetActiveShelvesAsync();
        Task<IEnumerable<Shelf>> GetShelvesByRackAsync(int rackId);
        Task<Shelf?> GetByCodeAsync(string code);
        Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null);
    }
}
