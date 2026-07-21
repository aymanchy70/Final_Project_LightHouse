using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class SectionRepository : GenericRepository<Section>, ISectionRepository
    {
        public SectionRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Section>> GetActiveSectionsAsync()
        {
            return await _dbSet
                .Where(s => s.IsActive)
                .Include(s => s.Floor)
                .OrderBy(s => s.SectionCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<Section>> GetSectionsByFloorAsync(int floorId)
        {
            return await _dbSet
                .Where(s => s.FloorId == floorId && s.IsActive)
                .OrderBy(s => s.SectionCode)
                .ToListAsync();
        }

        public async Task<Section?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.SectionCode == code && s.IsActive);
        }

        public async Task<bool> IsDuplicateCodeAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(s => s.SectionCode == code && s.IsActive);
            if (excludeId.HasValue)
                query = query.Where(s => s.SectionId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
