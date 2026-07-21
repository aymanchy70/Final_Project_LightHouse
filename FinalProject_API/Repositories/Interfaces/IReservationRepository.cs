using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IReservationRepository : IGenericRepository<Reservation>
    {
        Task<IEnumerable<Reservation>> GetActiveReservationsByMemberAsync(int memberId);
        Task<Reservation?> GetOldestPendingReservationForEditionAsync(int bookEditionId);
        Task<bool> HasPendingReservationAsync(int memberId, int bookEditionId);
    }
}
