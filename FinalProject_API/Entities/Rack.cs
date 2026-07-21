using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Rack : BaseEntity
    {
        [Key]
        public int RackId { get; set; }

        [Required]
        public int SectionId { get; set; }

        [Required(ErrorMessage = "Rack code is required")]
        [StringLength(20)]
        public string RackCode { get; set; } = string.Empty;   // e.g., "R-01"

        [StringLength(150)]
        public string? RackName { get; set; }

        public int TotalShelves { get; set; } = 6;

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }

        [ForeignKey(nameof(SectionId))]
        public virtual Section? Section { get; set; }
        public ICollection<Shelf> Shelves { get; set; } = new List<Shelf>();
    }
}
