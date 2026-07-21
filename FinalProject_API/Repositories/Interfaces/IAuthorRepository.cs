using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IAuthorRepository : IGenericRepository<Author>
    {
        Task<IEnumerable<Author>> GetActiveAuthorsAsync();
        Task<Author?> GetByFullNameAsync(string fullName);
        Task<bool> IsDuplicateAsync(string fullName, int? excludeId = null);
    }
}
