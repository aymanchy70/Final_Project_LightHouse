using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.PurchaseOrder
{
    public class ReceiveOrderDto
    {
        [Required]
        public DateTime ReceiveDate { get; set; }

        [Required]
        public List<ReceiveOrderItemDto> Items { get; set; } = new();
    }

    public class ReceiveOrderItemDto
    {
        [Required]
        public int PurchaseOrderItemId { get; set; }

        [Required, Range(1, 1000)]
        public int Quantity { get; set; }

        [Required]
        public int ShelfId { get; set; }
    }
}
