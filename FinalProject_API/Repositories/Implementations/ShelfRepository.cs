using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class ShelfRepository : GenericRepository<Shelf>, IShelfRepository
    {
        public ShelfRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Shelf>> GetActiveShelvesAsync()
        {
            return await _dbSet
                .Include(s => s.Rack)
                    .ThenInclude(r => r!.Section)
                        .ThenInclude(sec => sec!.Floor)
                .Where(s => s.IsActive)
                .OrderBy(s => s.ShelfCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<Shelf>> GetShelvesByRackAsync(int rackId)
        {
            return await _dbSet
                .Where(s => s.RackId == rackId && s.IsActive)
                .OrderBy(s => s.ShelfLevel)
                .ToListAsync();
        }

        public async Task<Shelf?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.ShelfCode == code && s.IsActive);
        }

        public async Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(s => s.ShelfCode == code && s.IsActive);
            if (excludeId.HasValue) query = query.Where(s => s.ShelfId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
