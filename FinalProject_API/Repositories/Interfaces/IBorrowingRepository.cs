using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IBorrowingRepository : IGenericRepository<BorrowingRecord>
    {
        Task<IEnumerable<BorrowingRecord>> GetActiveBorrowingsByMemberAsync(int memberId);
        Task<BorrowingRecord?> GetBorrowingWithDetailsAsync(int borrowingId);
        Task<int> GetActiveBorrowingCountAsync(int memberId);
        Task UpdateOverdueStatusesAsync();
        Task<IEnumerable<BorrowingRecord>> GetPendingRequestsAsync();
        Task<IEnumerable<BorrowingRecord>> GetAllActiveBorrowingsAsync();
        Task<bool> HasActiveBorrowingForBookAsync(int memberId, int bookId);
        Task<HashSet<int>> GetActiveBorrowedBookIdsAsync(int memberId);
        Task<IEnumerable<BorrowingRecord>> GetAllBorrowingsByMemberAsync(int memberId);
    }
}
