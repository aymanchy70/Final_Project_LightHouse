using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class DigitalCopyRepository : GenericRepository<DigitalCopy>, IDigitalCopyRepository
    {
        public DigitalCopyRepository(AppDbContext context) : base(context) { }

        public async Task<DigitalCopy?> GetByEditionAsync(int bookEditionId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(dc => dc.BookEditionId == bookEditionId && dc.IsActive);
        }
    }
}
