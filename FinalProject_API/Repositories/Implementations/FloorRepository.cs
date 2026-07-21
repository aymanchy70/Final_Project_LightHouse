using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class FloorRepository : GenericRepository<Floor>, IFloorRepository
    {
        public FloorRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Floor>> GetActiveFloorsAsync()
        {
            return await _dbSet.Where(f => f.IsActive).OrderBy(f => f.FloorCode).ToListAsync();
        }

        public async Task<Floor?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(f => f.FloorCode == code && f.IsActive);
        }

        public async Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(f => f.FloorCode == code && f.IsActive);
            if (excludeId.HasValue)
                query = query.Where(f => f.FloorId != excludeId.Value);
            return await query.AnyAsync();
        }

        public async Task<IEnumerable<Floor>> GetFullLocationTreeAsync()
        {
            return await _dbSet
                .Where(f => f.IsActive)
                .Include(f => f.Sections.Where(s => s.IsActive))
                    .ThenInclude(s => s.Racks.Where(r => r.IsActive))
                        .ThenInclude(r => r.Shelves.Where(sh => sh.IsActive))
                .OrderBy(f => f.FloorCode)
                .ToListAsync();
        }
    }
}
