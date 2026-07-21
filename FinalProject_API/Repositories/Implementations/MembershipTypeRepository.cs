using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class MembershipTypeRepository : GenericRepository<MembershipType>, IMembershipTypeRepository
    {
        public MembershipTypeRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<MembershipType>> GetActiveTypesAsync()
        {
            return await _dbSet.Where(mt => mt.IsActive).OrderBy(mt => mt.Name).ToListAsync();
        }

        public async Task<MembershipType?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(mt => mt.Name == name && mt.IsActive);
        }

        public async Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(mt => mt.Name == name && mt.IsActive);
            if (excludeId.HasValue)
                query = query.Where(mt => mt.MembershipTypeId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
