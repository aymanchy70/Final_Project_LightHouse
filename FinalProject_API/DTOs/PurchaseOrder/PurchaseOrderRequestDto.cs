using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.DTOs.PurchaseOrder
{
    public class PurchaseOrderRequestDto
    {
        [Required]
        public int SupplierId { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.Now;
        [Required]
        public DateTime ReceiveDate { get; set; }
        public decimal AdditionalCharge { get; set; } = 0;
        [Required]
        public List<PurchaseOrderItemDto> Items { get; set; } = new List<PurchaseOrderItemDto>();

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
