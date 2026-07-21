using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IBookEditionRepository : IGenericRepository<BookEdition>
    {
        Task<IEnumerable<BookEdition>> GetActiveEditionsAsync();
        Task<IEnumerable<BookEdition>> GetEditionsByBookAsync(int bookId);
        Task<BookEdition?> GetEditionWithDetailsAsync(int id); // includes Book and Publisher
        Task<bool> IsDuplicateISBNAsync(string isbn, int? excludeId = null);
    }
}
