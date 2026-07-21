using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Book
{
    public class BookRequestDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Subtitle { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public int? ItemCategoryId { get; set; }
        public int? SubCategoryId { get; set; }

        [StringLength(20)]
        public string BaseLibraryCode { get; set; } = string.Empty;

        [StringLength(13)]
        public string? MasterISBN { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        public int? PublicationYear { get; set; }
        public int? PageCount { get; set; }

        [StringLength(500)]
        public string? CoverImageUrl { get; set; }

        // New property for file upload
        [Display(Name = "Cover Image")]
        public IFormFile? CoverImageFile { get; set; }
        public bool IsRareBook { get; set; }
        public bool RequiresSecurityDeposit { get; set; }
        public decimal? SecurityDepositAmount { get; set; }

        public int? PublisherId { get; set; }

        [StringLength(30)]
        public string? DDCNumber { get; set; }

        [StringLength(30)]
        public string? CutterNumber { get; set; }

        public List<int> AuthorIds { get; set; } = new List<int>();
    }
}

