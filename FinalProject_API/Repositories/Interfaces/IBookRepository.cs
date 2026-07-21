using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IBookRepository : IGenericRepository<Book>
    {
        Task<IEnumerable<Book>> GetActiveBooksAsync();
        Task<Book?> GetBookWithDetailsAsync(int id);        // Includes authors, category, etc.
        Task<bool> IsDuplicateBaseLibraryCodeAsync(string code, int? excludeId = null);
        Task<bool> IsDuplicateMasterISBNAsync(string? isbn, int? excludeId = null);
        Task<string> GenerateMasterISBNAsync();
        Task<Dictionary<int, bool>> GetDigitalCopyAvailabilityAsync(IEnumerable<int> bookIds);
    }
}
