namespace FinalProject_API.DTOs.MembershipType
{
    public class MembershipTypeResponseDto
    {
        public int MembershipTypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxBooksCanBorrow { get; set; }
        public int LoanPeriodDays { get; set; }
        public int MaxBooksForInLibraryReading { get; set; }
        public decimal? MaxOutstandingFine { get; set; }
        public bool CanBorrowRareBooks { get; set; }
        public decimal? YearlyFee { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
