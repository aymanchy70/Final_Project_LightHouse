namespace FinalProject_API.DTOs.Borrowing
{
    public class BorrowingResponseDto
    {
        public int BorrowingId { get; set; }
        public int MemberId { get; set; }
        public string? MemberName { get; set; }
        public int PhysicalCopyId { get; set; }
        public string? BookTitle { get; set; }
        public string? Barcode { get; set; }
        public DateTime RequestedDate { get; set; }
        public bool IsDigital { get; set; }
        public DateTime? IssueDate { get; set; }  // become nullable
        public DateTime? DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? FineAmount { get; set; }
        public bool FinePaid { get; set; }
    }
}
