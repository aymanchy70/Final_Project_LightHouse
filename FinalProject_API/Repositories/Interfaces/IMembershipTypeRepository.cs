using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IMembershipTypeRepository : IGenericRepository<MembershipType>
    {
        Task<IEnumerable<MembershipType>> GetActiveTypesAsync();
        Task<MembershipType?> GetByNameAsync(string name);
        Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null);
    }
}
