using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Shelf : BaseEntity
    {
        [Key]
        public int ShelfId { get; set; }

        [Required]
        public int RackId { get; set; }

        [Required(ErrorMessage = "Shelf code is required")]
        [StringLength(30)]
        public string ShelfCode { get; set; } = string.Empty;   // e.g., "R-01-SH-A"

        public int ShelfLevel { get; set; } = 1;                // 1 = top

        [StringLength(20)]
        public string ShelfLabel { get; set; } = string.Empty;  // e.g., "SH-A"

        public int MaxCapacity { get; set; } = 80;              // default as per PDF

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }

        [ForeignKey(nameof(RackId))]
        public virtual Rack? Rack { get; set; }
        public ICollection<PhysicalCopy> PhysicalCopies { get; set; } = new List<PhysicalCopy>();
    }
}
