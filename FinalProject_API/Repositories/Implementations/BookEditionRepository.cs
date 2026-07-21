using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class BookEditionRepository : GenericRepository<BookEdition>, IBookEditionRepository
    {
        public BookEditionRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<BookEdition>> GetActiveEditionsAsync()
        {
            return await _dbSet
                .Where(e => e.IsActive)
                .Include(e => e.Book)
                .Include(e => e.Publisher)
                .OrderBy(e => e.Edition)
                .ToListAsync();
        }

        public async Task<IEnumerable<BookEdition>> GetEditionsByBookAsync(int bookId)
        {
            return await _dbSet
                .Where(e => e.BookId == bookId && e.IsActive)
                .Include(e => e.Publisher)
                .OrderBy(e => e.Edition)
                .ToListAsync();
        }

        public async Task<BookEdition?> GetEditionWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(e => e.Book)
                .Include(e => e.Publisher)
                .FirstOrDefaultAsync(e => e.BookEditionId == id);
        }

        public async Task<bool> IsDuplicateISBNAsync(string isbn, int? excludeId = null)
        {
            var query = _dbSet.Where(e => e.ISBN == isbn && e.IsActive);
            if (excludeId.HasValue)
                query = query.Where(e => e.BookEditionId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
