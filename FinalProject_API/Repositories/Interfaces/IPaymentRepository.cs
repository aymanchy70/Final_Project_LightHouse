using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<IEnumerable<Payment>> GetPaymentsByMemberAsync(int memberId);
    }
}
