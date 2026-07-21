using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IGRNRepository : IGenericRepository<GRN>
    {
        Task<IEnumerable<GRN>> GetAllWithDetailsAsync();
        Task<GRN?> GetByIdWithDetailsAsync(int id);
        Task<string> GenerateGRNNumberAsync();
    }
}
