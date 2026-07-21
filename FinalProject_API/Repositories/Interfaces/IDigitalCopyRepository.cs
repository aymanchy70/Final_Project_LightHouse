using FinalProject_API.Entities;

namespace FinalProject_API.Repositories.Interfaces
{
    public interface IDigitalCopyRepository : IGenericRepository<DigitalCopy>
    {
        Task<DigitalCopy?> GetByEditionAsync(int bookEditionId);
    }
}
