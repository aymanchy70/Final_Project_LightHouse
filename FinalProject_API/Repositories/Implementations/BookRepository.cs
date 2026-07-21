using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class BookRepository : GenericRepository<Book>, IBookRepository
    {
        public BookRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Book>> GetActiveBooksAsync()
        {
            return await _dbSet
                .Where(b => b.IsActive)
                .Include(b => b.ItemCategory)
                .Include(b => b.SubCategory)
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .OrderBy(b => b.Title)
                .ToListAsync();
        }

        public async Task<Book?> GetBookWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(b => b.ItemCategory)
                .Include(b => b.SubCategory)
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .FirstOrDefaultAsync(b => b.BookId == id);
        }

        public async Task<bool> IsDuplicateBaseLibraryCodeAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(b => b.BaseLibraryCode == code && b.IsActive);
            if (excludeId.HasValue)
                query = query.Where(b => b.BookId != excludeId.Value);
            return await query.AnyAsync();
        }

        public async Task<bool> IsDuplicateMasterISBNAsync(string? isbn, int? excludeId = null)
        {
            if (string.IsNullOrEmpty(isbn)) return false;
            var query = _dbSet.Where(b => b.MasterISBN == isbn && b.IsActive);
            if (excludeId.HasValue)
                query = query.Where(b => b.BookId != excludeId.Value);
            return await query.AnyAsync();
        }

        public async Task<string> GenerateMasterISBNAsync()
        {
            int year = DateTime.UtcNow.Year;
            var latest = await _dbSet
                .Where(b => b.MasterISBN != null && b.MasterISBN.StartsWith($"MS-{year}-"))
                .OrderByDescending(b => b.MasterISBN)
                .FirstOrDefaultAsync();
            int nextSeq = 1;
            if (latest != null)
            {
                string lastSeqStr = latest.MasterISBN!.Substring($"MS-{year}-".Length);
                if (int.TryParse(lastSeqStr, out int lastSeq))
                    nextSeq = lastSeq + 1;
            }
            return $"MS-{year}-{nextSeq:D4}";
        }

        public async Task<Dictionary<int, bool>> GetDigitalCopyAvailabilityAsync(IEnumerable<int> bookIds)
        {
            // Step 1: Get BookEditionIds for the given bookIds
            var editionIdsForBooks = await _context.BookEditions
                .Where(be => bookIds.Contains(be.BookId))
                .Select(be => new { be.BookEditionId, be.BookId })
                .ToListAsync();

            // Step 2: Get all BookEditionIds that have an active digital copy
            var digitalEditionIds = await _context.DigitalCopies
                .Where(dc => dc.IsActive)
                .Select(dc => dc.BookEditionId)
                .Distinct()
                .ToListAsync();

            // Step 3: Build a set of BookIds that have at least one digital copy
            var bookIdsWithDigital = editionIdsForBooks
                .Where(e => digitalEditionIds.Contains(e.BookEditionId))
                .Select(e => e.BookId)
                .ToHashSet();

            return bookIds.ToDictionary(id => id, id => bookIdsWithDigital.Contains(id));
        }
    }
}
