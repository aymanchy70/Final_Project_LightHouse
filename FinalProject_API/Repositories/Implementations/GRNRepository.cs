using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class GRNRepository : GenericRepository<GRN>, IGRNRepository
    {
        public GRNRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<GRN>> GetAllWithDetailsAsync()
        {
            return await _dbSet
                .Include(g => g.Items)
                    .ThenInclude(i => i.PurchaseOrderItem!)
                        .ThenInclude(poi => poi.BookEdition!)
                            .ThenInclude(be => be.Book)
                .Include(g => g.Items)
                    .ThenInclude(i => i.Shelf)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();
        }

        public async Task<GRN?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(g => g.Items)
                    .ThenInclude(i => i.PurchaseOrderItem!)
                        .ThenInclude(poi => poi.BookEdition!)
                            .ThenInclude(be => be.Book)
                .Include(g => g.Items)
                    .ThenInclude(i => i.Shelf)
                .FirstOrDefaultAsync(g => g.GRNId == id);
        }

        public async Task<string> GenerateGRNNumberAsync()
        {
            int year = DateTime.Now.Year;
            var last = await _dbSet
                .Where(g => g.GRN_Number.StartsWith($"GRN-{year}-"))
                .OrderByDescending(g => g.GRN_Number)
                .FirstOrDefaultAsync();
            int seq = 1;
            if (last != null && int.TryParse(last.GRN_Number.Substring($"GRN-{year}-".Length), out int lastSeq))
                seq = lastSeq + 1;
            return $"GRN-{year}-{seq:D4}";
        }
    }
}
