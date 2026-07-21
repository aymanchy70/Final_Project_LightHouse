using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class SupplierRepository : GenericRepository<Supplier>, ISupplierRepository
    {
        public SupplierRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Supplier>> GetActiveSuppliersAsync()
        {
            return await _dbSet.Where(s => s.IsActive).OrderBy(s => s.Name).ToListAsync();
        }

        public async Task<Supplier?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.Name == name && s.IsActive);
        }

        public async Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(s => s.Name == name && s.IsActive);
            if (excludeId.HasValue) query = query.Where(s => s.SupplierId != excludeId.Value);
            return await query.AnyAsync();
        }
    }
}
