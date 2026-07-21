using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class RackRepository : GenericRepository<Rack>, IRackRepository
    {
        public RackRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Rack>> GetActiveRacksAsync()
        {
            return await _dbSet
                .Include(r => r.Section)
                    .ThenInclude(s => s!.Floor)
                .Where(r => r.IsActive)
                .OrderBy(r => r.RackCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rack>> GetRacksBySectionAsync(int sectionId)
        {
            return await _dbSet
                .Where(r => r.SectionId == sectionId && r.IsActive)
                .OrderBy(r => r.RackCode)
                .ToListAsync();
        }

        public async Task<Rack?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(r => r.RackCode == code && r.IsActive);
        }

        public async Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(r => r.RackCode == code && r.IsActive);
            if (excludeId.HasValue) query = query.Where(r => r.RackId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
