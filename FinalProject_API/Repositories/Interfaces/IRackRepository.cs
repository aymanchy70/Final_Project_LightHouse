using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IRackRepository : IGenericRepository<Rack>
    {
        Task<IEnumerable<Rack>> GetActiveRacksAsync();
        Task<IEnumerable<Rack>> GetRacksBySectionAsync(int sectionId);
        Task<Rack?> GetByCodeAsync(string code);
        Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null);
    }
}
