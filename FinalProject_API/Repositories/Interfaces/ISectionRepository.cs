using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface ISectionRepository : IGenericRepository<Section>
    {
        Task<IEnumerable<Section>> GetActiveSectionsAsync();
        Task<IEnumerable<Section>> GetSectionsByFloorAsync(int floorId);
        Task<Section?> GetByCodeAsync(string code);
        Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null);
    }
}
