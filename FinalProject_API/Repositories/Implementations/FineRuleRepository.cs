using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class FineRuleRepository : GenericRepository<FineRule>, IFineRuleRepository
    {
        public FineRuleRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<FineRule>> GetActiveRulesAsync()
        {
            return await _dbSet.Where(fr => fr.IsActive).OrderBy(fr => fr.RuleName).ToListAsync();
        }

        public async Task<FineRule?> GetByRuleNameAsync(string ruleName)
        {
            return await _dbSet.FirstOrDefaultAsync(fr => fr.RuleName == ruleName && fr.IsActive);
        }
    }
}
