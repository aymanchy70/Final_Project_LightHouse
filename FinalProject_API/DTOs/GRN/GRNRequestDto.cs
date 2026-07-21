using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.GRN
{
    public class GRNRequestDto
    {
        [Required]
        public DateTime ReceivedDate { get; set; }

        [StringLength(100)]
        public string? ReceivedBy { get; set; }

        [StringLength(50)]
        public string? VehicleNumber { get; set; }

        [StringLength(100)]
        public string? DeliveryPersonName { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [Required]
        public List<GRNItemDto> Items { get; set; } = new();
    }

    public class GRNItemDto
    {
        [Required]
        public int PurchaseOrderItemId { get; set; }

        [Required, Range(1, 9999)]
        public int Quantity { get; set; }

        [Required]
        public int ShelfId { get; set; }
    }
}
