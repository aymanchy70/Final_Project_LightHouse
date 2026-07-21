using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IPurchaseOrderRepository : IGenericRepository<PurchaseOrder>
    {
        Task<IEnumerable<PurchaseOrder>> GetAllWithItemsAsync();
        Task<PurchaseOrder?> GetOrderWithItemsAsync(int id);
    }
}
