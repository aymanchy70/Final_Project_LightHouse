using FinalProject_API.Data;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Repositories.Implementations
{
    public class PurchaseOrderRepository : GenericRepository<PurchaseOrder>, IPurchaseOrderRepository
    {
        public PurchaseOrderRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<PurchaseOrder>> GetAllWithItemsAsync()
        {
            return await _dbSet
                .Include(po => po.Supplier)
                .Include(po => po.Items)
                    .ThenInclude(i => i.BookEdition!)
                        .ThenInclude(be => be.Book)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<PurchaseOrder?> GetOrderWithItemsAsync(int id)
        {
            return await _dbSet
                .Include(po => po.Supplier)
                .Include(po => po.Items)
                    .ThenInclude(i => i.BookEdition!)
                        .ThenInclude(be => be.Book)
                .FirstOrDefaultAsync(po => po.PurchaseOrderId == id);
        }
    }
}
