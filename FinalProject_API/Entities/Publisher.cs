using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class Publisher : BaseEntity
    {
        [Key]
        public int PublisherId { get; set; }

        [Required(ErrorMessage = "Publisher Name is required")]
        [StringLength(100, ErrorMessage = "Publisher Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string? Phone { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(200)]
        public string? Website { get; set; }

        // Navigation property (will be added when BookEdition exists)
        // public ICollection<BookEdition> BookEditions { get; set; } = new List<BookEdition>();
    }
}
