using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class MemberRepository : GenericRepository<Member>, IMemberRepository
    {
        public MemberRepository(AppDbContext context) : base(context) { }

        public async Task<Member?> GetByUserIdAsync(int userId)
        {
            return await _dbSet.Include(m => m.MembershipType)
                               .FirstOrDefaultAsync(m => m.UserId == userId && m.IsActive);
        }

        public async Task<Member?> GetMemberWithDetailsAsync(int memberId)
        {
            return await _dbSet.Include(m => m.MembershipType)
                               .FirstOrDefaultAsync(m => m.MemberId == memberId && m.IsActive);
        }

        public async Task<IEnumerable<Member>> GetActiveMembersAsync()
        {
            return await _dbSet.Where(m => m.IsActive)
                               .Include(m => m.MembershipType)
                               .OrderBy(m => m.FullName)
                               .ToListAsync();
        }

        public async Task<bool> IsUserAlreadyMemberAsync(int userId)
        {
            return await _dbSet.AnyAsync(m => m.UserId == userId && m.IsActive);
        }

        public async Task<int> GetCurrentBorrowedCountAsync(int memberId)
        {
            // Placeholder until BorrowingRecord entity exists – will return 0 for now
            // Later: count active BorrowingRecord for this member
            return await Task.FromResult(0);
        }
    }
}
