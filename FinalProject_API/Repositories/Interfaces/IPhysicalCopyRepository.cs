using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IPhysicalCopyRepository : IGenericRepository<PhysicalCopy>
    {
        Task<IEnumerable<PhysicalCopy>> GetActiveCopiesAsync();
        Task<IEnumerable<PhysicalCopy>> GetCopiesByEditionAsync(int bookEditionId);
        Task<PhysicalCopy?> GetCopyWithDetailsAsync(int id);
        Task<int> GetNextCopySerialNumberAsync(string baseLibraryCode);
        Task<int> GetOccupiedCountOnShelfAsync(int shelfId);
        Task<int> GetNextPositionOnShelfAsync(int shelfId);

        Task<int> GetMaxPositionOnShelfExcludingAsync(int shelfId, IEnumerable<int> excludeCopyIds); //for bulk shelving
    }
}
