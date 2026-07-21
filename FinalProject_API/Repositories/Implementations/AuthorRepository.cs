using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class AuthorRepository : GenericRepository<Author>, IAuthorRepository
    {
        public AuthorRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Author>> GetActiveAuthorsAsync()
        {
            return await _dbSet
                .Where(a => a.IsActive)
                .OrderBy(a => a.FullName)
                .ToListAsync();
        }

        public async Task<Author?> GetByFullNameAsync(string fullName)
        {
            return await _dbSet
                .FirstOrDefaultAsync(a => a.FullName == fullName && a.IsActive);
        }

        public async Task<bool> IsDuplicateAsync(string fullName, int? excludeId = null)
        {
            var query = _dbSet.Where(a => a.FullName == fullName && a.IsActive);
            if (excludeId.HasValue)
                query = query.Where(a => a.AuthorId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
