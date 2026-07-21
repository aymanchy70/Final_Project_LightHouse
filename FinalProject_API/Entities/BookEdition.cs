using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class BookEdition : BaseEntity
    {
        [Key]
        public int BookEditionId { get; set; }

        // Foreign Key to Book
        [Required]
        public int BookId { get; set; }

        [Required(ErrorMessage = "Edition is required")]
        [StringLength(50)]
        public string Edition { get; set; } = string.Empty; // "1st", "2nd", "Revised"

        [Required(ErrorMessage = "ISBN is required")]
        [StringLength(13)]
        public string ISBN { get; set; } = string.Empty; // Edition-specific ISBN

        public int? PublicationYear { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        public int? PageCount { get; set; }

        public bool HasSoftCopy { get; set; }

        // Print type
        [StringLength(50)]
        public string? PaperType { get; set; } // "White Paper", "Yellow Paper", "Premium"

        [StringLength(50)]
        public string? CoverType { get; set; } // "Hardcover", "Paperback"

        [StringLength(500)]
        public string? CoverImageUrl { get; set; }

        public decimal? Price { get; set; }

        // Publisher (optional FK)
        public int? PublisherId { get; set; }

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        [ForeignKey("PublisherId")]
        public virtual Publisher? Publisher { get; set; }

        // Future collections – commented until entities exist
        public ICollection<PhysicalCopy> PhysicalCopies { get; set; } = new List<PhysicalCopy>();
         public ICollection<DigitalCopy> DigitalCopies { get; set; } = new List<DigitalCopy>();
        // public ICollection<HoldRequest> Reservations { get; set; } = new List<HoldRequest>();
        // public ICollection<InventoryRecord> InventoryRecords { get; set; } = new List<InventoryRecord>();
    }
}
