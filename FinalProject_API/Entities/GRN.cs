using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class GRN : BaseEntity
    {
        [Key]
        public int GRNId { get; set; }

        [Required, StringLength(20)]
        public string GRN_Number { get; set; } = string.Empty;   // Auto-generated: GRN-2026-0001

        public DateTime ReceivedDate { get; set; } = DateTime.Now;

        [StringLength(100)]
        public string? ReceivedBy { get; set; }

        [StringLength(50)]
        public string? VehicleNumber { get; set; }

        [StringLength(100)]
        public string? DeliveryPersonName { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public ICollection<GRNItem> Items { get; set; } = new List<GRNItem>();
    }
}
