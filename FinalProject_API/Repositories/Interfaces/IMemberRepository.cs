using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IMemberRepository : IGenericRepository<Member>
    {
        Task<Member?> GetByUserIdAsync(int userId);
        Task<Member?> GetMemberWithDetailsAsync(int memberId);  // includes MembershipType
        Task<IEnumerable<Member>> GetActiveMembersAsync();
        Task<bool> IsUserAlreadyMemberAsync(int userId);
        Task<int> GetCurrentBorrowedCountAsync(int memberId);   // will be used later
    }
}
