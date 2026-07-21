using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class PhysicalCopyRepository : GenericRepository<PhysicalCopy>, IPhysicalCopyRepository
    {
        public PhysicalCopyRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<PhysicalCopy>> GetActiveCopiesAsync()
        {
            return await _dbSet
                .Include(pc => pc.BookEdition)
                    .ThenInclude(be => be!.Book)
                .Include(pc => pc.Shelf)
                    .ThenInclude(s => s!.Rack)
                        .ThenInclude(r => r!.Section)
                            .ThenInclude(sec => sec!.Floor)
                .Where(pc => pc.IsActive)
                .OrderBy(pc => pc.BookEdition!.Book!.Title)
                .ThenBy(pc => pc.CopySerialNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<PhysicalCopy>> GetCopiesByEditionAsync(int bookEditionId)
        {
            return await _dbSet
                .Where(pc => pc.BookEditionId == bookEditionId && pc.IsActive)
                .OrderBy(pc => pc.CopySerialNumber)
                .ToListAsync();
        }

        public async Task<PhysicalCopy?> GetCopyWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(pc => pc.BookEdition)
                    .ThenInclude(be => be!.Book)
                .Include(pc => pc.Shelf)
                    .ThenInclude(s => s!.Rack)
                        .ThenInclude(r => r!.Section)
                            .ThenInclude(sec => sec!.Floor)
                .FirstOrDefaultAsync(pc => pc.PhysicalCopyId == id);
        }

        public async Task<int> GetNextCopySerialNumberAsync(string baseLibraryCode)
        {
            var maxSerial = await _dbSet
                .Where(pc => pc.BaseLibraryCode == baseLibraryCode)
                .MaxAsync(pc => (int?)pc.CopySerialNumber) ?? 0;
            return maxSerial + 1;
        }

        public async Task<int> GetOccupiedCountOnShelfAsync(int shelfId)
        {
            return await _dbSet
                .CountAsync(pc => pc.ShelfId == shelfId && pc.IsActive
                    && !new[] { "Lost", "Disposed" }.Contains(pc.Status));
        }

        public async Task<int> GetNextPositionOnShelfAsync(int shelfId)
        {
            var maxPosition = await _dbSet
                .Where(pc => pc.ShelfId == shelfId)
                .MaxAsync(pc => (int?)pc.PositionOnShelf) ?? 0;
            return maxPosition + 1;
        }

        public async Task<int> GetMaxPositionOnShelfExcludingAsync(int shelfId, IEnumerable<int> excludeCopyIds)
        {
            return await _dbSet
                .Where(pc => pc.ShelfId == shelfId && !excludeCopyIds.Contains(pc.PhysicalCopyId))
                .MaxAsync(pc => (int?)pc.PositionOnShelf) ?? 0;
        }
    }
}
