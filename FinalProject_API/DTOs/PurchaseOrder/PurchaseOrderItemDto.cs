using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.PurchaseOrder
{
    public class PurchaseOrderItemDto
    {
        [Required]
        public int BookEditionId { get; set; }

        [Required, Range(1, 1000)]
        public int Quantity { get; set; }

        public decimal? UnitCost { get; set; }
    }
}
