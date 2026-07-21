using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class PublisherRepository : GenericRepository<Publisher>, IPublisherRepository
    {
        public PublisherRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Publisher>> GetActivePublishersAsync()
        {
            return await _dbSet
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<Publisher?> GetByNameAsync(string name)
        {
            return await _dbSet
                .FirstOrDefaultAsync(p => p.Name == name && p.IsActive);
        }

        public async Task<bool> IsDuplicateAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(p => p.Name == name && p.IsActive);
            if (excludeId.HasValue)
                query = query.Where(p => p.PublisherId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}