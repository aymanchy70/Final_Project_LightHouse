using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.MembershipType
{
    public class MembershipTypeRequestDto
    {
        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        [Range(1, 50)]
        public int MaxBooksCanBorrow { get; set; } = 5;

        [Range(1, 365)]
        public int LoanPeriodDays { get; set; } = 14;

        [Range(1, 20)]
        public int MaxBooksForInLibraryReading { get; set; } = 5;
        public decimal? MaxOutstandingFine { get; set; }
        public decimal? YearlyFee { get; set; }

        public bool CanBorrowRareBooks { get; set; } = false;

    }
}
