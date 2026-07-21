namespace FinalProject_API.DTOs.Book
{
    public class BookResponseDto
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }

        public int? ItemCategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? SubCategoryId { get; set; }
        public string? SubCategoryName { get; set; }
        public int AvailableCopies { get; set; }


        public string? MasterISBN { get; set; }
        public string? Language { get; set; }
        public int? PublicationYear { get; set; }
        public int? PageCount { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool HasDigitalCopy { get; set; }

        public string? DDCNumber { get; set; }
        public string? CutterNumber { get; set; }
        public string? CallNumber { get; set; }   // computed

        public bool IsRareBook { get; set; }
        public bool RequiresSecurityDeposit { get; set; }
        public decimal? SecurityDepositAmount { get; set; }

        public int? PublisherId { get; set; }
        public string? PublisherName { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Authors list
        public List<AuthorBriefDto> Authors { get; set; } = new List<AuthorBriefDto>();
    }

    public class AuthorBriefDto
    {
        public int AuthorId { get; set; }
        public string FullName { get; set; } = string.Empty;
    }
}

