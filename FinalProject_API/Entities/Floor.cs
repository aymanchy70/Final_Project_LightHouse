using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class Floor : BaseEntity
    {
        [Key]
        public int FloorId { get; set; }

        [Required(ErrorMessage = "Floor code is required")]
        [StringLength(10)]
        public string FloorCode { get; set; } = string.Empty;   // e.g., "F1", "F2"

        [Required(ErrorMessage = "Floor name is required")]
        [StringLength(100)]
        public string FloorName { get; set; } = string.Empty;   // e.g., "Ground Floor"

        [StringLength(500)]
        public string? Description { get; set; }

        public ICollection<Section> Sections { get; set; } = new List<Section>();
    }
}
