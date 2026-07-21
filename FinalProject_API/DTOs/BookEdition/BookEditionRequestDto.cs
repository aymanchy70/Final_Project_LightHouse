using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.BookEdition
{
    public class BookEditionRequestDto
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        [StringLength(50)]
        public string Edition { get; set; } = string.Empty;

        [Required]
        [StringLength(13)]
        public string ISBN { get; set; } = string.Empty;

        public int? PublicationYear { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        public int? PageCount { get; set; }
        public bool HasSoftCopy { get; set; }

        [StringLength(50)]
        public string? PaperType { get; set; }

        [StringLength(50)]
        public string? CoverType { get; set; }

        [StringLength(500)]
        public string? CoverImageUrl { get; set; }

        [Display(Name = "Cover Image")]
        public IFormFile? CoverImageFile { get; set; }

        public decimal? Price { get; set; }
        public int? PublisherId { get; set; }
    }
}

