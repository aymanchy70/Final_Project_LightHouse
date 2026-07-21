using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Book : BaseEntity
    {
        [Key]
        public int BookId { get; set; }

        // Basic Info
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Subtitle { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        // Classification
        public int? ItemCategoryId { get; set; }      // FK to ItemCategory (Category)
        public int? SubCategoryId { get; set; }       // FK to SubCategory

        // Auto-generated code for all editions/copies
        [StringLength(20)]
        public string BaseLibraryCode { get; set; } = string.Empty;

        // Optional master ISBN (if same across editions)
        [StringLength(13)]
        [Remote("IsMasterISBNUnique", "Book", AdditionalFields = nameof(BookId), ErrorMessage = "ISBN already exists.")]
        public string? MasterISBN { get; set; }

        // Book properties
        [StringLength(50)]
        public string? Language { get; set; }

        public int? PublicationYear { get; set; }

        public int? PageCount { get; set; }

        [StringLength(500)]
        public string? CoverImageUrl { get; set; }

        // Special flags
        public bool IsRareBook { get; set; }
        public bool RequiresSecurityDeposit { get; set; }
        public decimal? SecurityDepositAmount { get; set; }


        [StringLength(30)]
        public string? DDCNumber { get; set; }

        [StringLength(30)]
        public string? CutterNumber { get; set; }

        /// <summary>Computed call number (not mapped to database).</summary>
        [NotMapped]
        public string? CallNumber =>
            (string.IsNullOrEmpty(DDCNumber) && string.IsNullOrEmpty(CutterNumber))
                ? null
                : $"{DDCNumber ?? ""} / {CutterNumber ?? ""}";

        // Publisher
        public int? PublisherId { get; set; }

        // Navigation properties
        public ItemCategory? ItemCategory { get; set; }
        public SubCategory? SubCategory { get; set; }
        public Publisher? Publisher { get; set; }
        public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
        public ICollection<BookEdition> Editions { get; set; } = new List<BookEdition>(); // will add later
    }
}
