namespace FinalProject_API.DTOs.BookEdition
{
    public class BookEditionResponseDto
    {
        public int BookEditionId { get; set; }
        public int BookId { get; set; }
        public string? BookTitle { get; set; }
        public string Edition { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int? PublicationYear { get; set; }
        public string? Language { get; set; }
        public int? PageCount { get; set; }
        public bool HasSoftCopy { get; set; }
        public string? PaperType { get; set; }
        public string? CoverType { get; set; }
        public string? CoverImageUrl { get; set; }
        public decimal? Price { get; set; }
        public int? PublisherId { get; set; }
        public string? PublisherName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
