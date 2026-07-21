using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class ReservationRepository : GenericRepository<Reservation>, IReservationRepository
    {
        public ReservationRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Reservation>> GetActiveReservationsByMemberAsync(int memberId)
        {
            return await _dbSet
                .Include(r => r.BookEdition!)
                    .ThenInclude(be => be.Book)
                .Where(r => r.MemberId == memberId && r.Status == "Pending")
                .OrderByDescending(r => r.ReservationDate)
                .ToListAsync();
        }

        public async Task<Reservation?> GetOldestPendingReservationForEditionAsync(int bookEditionId)
        {
            return await _dbSet
                .Where(r => r.BookEditionId == bookEditionId && r.Status == "Pending")
                .OrderBy(r => r.ReservationDate)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasPendingReservationAsync(int memberId, int bookEditionId)
        {
            return await _dbSet.AnyAsync(r =>
                r.MemberId == memberId &&
                r.BookEditionId == bookEditionId &&
                r.Status == "Pending");
        }
    }
}
