using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IFloorRepository : IGenericRepository<Floor>
    {
        Task<IEnumerable<Floor>> GetActiveFloorsAsync();
        Task<Floor?> GetByCodeAsync(string code);
        Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null);
        Task<IEnumerable<Floor>> GetFullLocationTreeAsync();
    }
}
