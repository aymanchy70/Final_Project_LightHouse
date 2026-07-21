using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class BorrowingRepository : GenericRepository<BorrowingRecord>, IBorrowingRepository
    {
        public BorrowingRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<BorrowingRecord>> GetActiveBorrowingsByMemberAsync(int memberId)
        {
            return await _dbSet
                .Include(br => br.PhysicalCopy)
                    .ThenInclude(pc => pc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Where(br => br.MemberId == memberId && (br.Status == "Borrowed" || br.Status == "Overdue"))
                .ToListAsync();
        }

        public async Task<BorrowingRecord?> GetBorrowingWithDetailsAsync(int borrowingId)
        {
            return await _dbSet
                .Include(br => br.PhysicalCopy)
                    .ThenInclude(pc => pc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Include(br => br.Member)
                    .ThenInclude(m => m!.MembershipType)
                .FirstOrDefaultAsync(br => br.BorrowingId == borrowingId);
        }

        public async Task<int> GetActiveBorrowingCountAsync(int memberId)
        {
            return await _dbSet
                .Where(br => br.MemberId == memberId && (br.Status == "Borrowed" || br.Status == "Overdue" || br.Status == "Pending"))
                .CountAsync();
        }
        public async Task UpdateOverdueStatusesAsync()
        {
            var overdueRecords = await _dbSet
                .Where(br => (br.Status == "Borrowed" || br.Status == "Overdue") && br.DueDate < DateTime.Now && br.ReturnDate == null)
                .ToListAsync();
            foreach (var record in overdueRecords)
            {
                record.Status = "Overdue";
            }
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<BorrowingRecord>> GetPendingRequestsAsync()
        {
            return await _dbSet
                .Include(br => br.Member)
                .Include(br => br.PhysicalCopy)
                    .ThenInclude(pc => pc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Where(br => br.Status == "Pending")
                .OrderBy(br => br.RequestedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BorrowingRecord>> GetAllActiveBorrowingsAsync()
        {
            return await _dbSet
                .Include(br => br.Member)
                .Include(br => br.PhysicalCopy)
                    .ThenInclude(pc => pc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Where(br => br.Status == "Borrowed" || br.Status == "Overdue")
                .OrderBy(br => br.DueDate)
                .ToListAsync();
        }

        public async Task<bool> HasActiveBorrowingForBookAsync(int memberId, int bookId)
        {
            // Check physical borrowings
            bool hasPhysical = await _dbSet.AnyAsync(br =>
                br.MemberId == memberId &&
                (br.Status == "Borrowed" || br.Status == "Overdue" || br.Status == "Pending") &&
                br.PhysicalCopy != null &&
                _context.BookEditions.Any(be => be.BookEditionId == br.PhysicalCopy.BookEditionId && be.BookId == bookId) &&
                br.IsActive);

            if (hasPhysical) return true;

            // Check digital borrowings
            bool hasDigital = await _dbSet.AnyAsync(br =>
                br.MemberId == memberId &&
                (br.Status == "Borrowed" || br.Status == "Overdue" || br.Status == "Pending") &&
                br.DigitalCopy != null &&
                _context.BookEditions.Any(be => be.BookEditionId == br.DigitalCopy.BookEditionId && be.BookId == bookId) &&
                br.IsActive);

            return hasDigital;
        }
        public async Task<HashSet<int>> GetActiveBorrowedBookIdsAsync(int memberId)
        {
            var physicalBookIds = await _dbSet
                .Where(br => br.MemberId == memberId && br.PhysicalCopy != null &&
                             br.Status != "Returned" && br.Status != "Rejected" &&
                             br.Status != "Lost" && br.Status != "Damaged" && br.IsActive)
                .Select(br => _context.BookEditions
                    .Where(be => be.BookEditionId == br.PhysicalCopy!.BookEditionId)
                    .Select(be => be.BookId)
                    .FirstOrDefault())
                .ToListAsync();

            var digitalBookIds = await _dbSet
                .Where(br => br.MemberId == memberId && br.DigitalCopy != null &&
                             br.Status != "Returned" && br.Status != "Rejected" &&
                             br.Status != "Lost" && br.Status != "Damaged" && br.IsActive)
                .Select(br => _context.BookEditions
                    .Where(be => be.BookEditionId == br.DigitalCopy!.BookEditionId)
                    .Select(be => be.BookId)
                    .FirstOrDefault())
                .ToListAsync();

            return new HashSet<int>(physicalBookIds.Union(digitalBookIds).Where(id => id != 0));
        }
        public async Task<IEnumerable<BorrowingRecord>> GetAllBorrowingsByMemberAsync(int memberId)
        {
            return await _dbSet
                .Include(br => br.PhysicalCopy)
                    .ThenInclude(pc => pc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Include(br => br.DigitalCopy)
                    .ThenInclude(dc => dc!.BookEdition)
                        .ThenInclude(be => be!.Book)
                .Where(br => br.MemberId == memberId && br.IsActive)
                .OrderByDescending(br => br.RequestedDate)
                .ToListAsync();
        }


    }
}
