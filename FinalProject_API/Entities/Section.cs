using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Section : BaseEntity
    {
        [Key]
        public int SectionId { get; set; }

        // FK to Floor
        [Required]
        public int FloorId { get; set; }

        [Required(ErrorMessage = "Section code is required")]
        [StringLength(20)]
        public string SectionCode { get; set; } = string.Empty;   // e.g., "SC-A", "REF"

        [Required(ErrorMessage = "Section name is required")]
        [StringLength(150)]
        public string SectionName { get; set; } = string.Empty;   // e.g., "Science & Technology"

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }

        public bool IsSpecial { get; set; } = false;   // e.g., Reference, Fiction

        // Navigation
        [ForeignKey(nameof(FloorId))]
        public virtual Floor? Floor { get; set; }

        public ICollection<Rack> Racks { get; set; } = new List<Rack>();
    }
}
