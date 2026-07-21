using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IFineRuleRepository : IGenericRepository<FineRule>
    {
        Task<IEnumerable<FineRule>> GetActiveRulesAsync();
        Task<FineRule?> GetByRuleNameAsync(string ruleName);
    }
}
