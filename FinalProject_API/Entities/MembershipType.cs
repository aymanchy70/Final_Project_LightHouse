using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class MembershipType : BaseEntity
    {
        [Key]
        public int MembershipTypeId { get; set; }

        [Required(ErrorMessage = "Membership type name is required")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        // Borrowing limits
        [Range(1, 50)]
        public int MaxBooksCanBorrow { get; set; } = 5;
        [Column(TypeName = "decimal(10,2)")]
        public decimal? MaxOutstandingFine { get; set; }   // null = no limit, 0 = must be zero, >0 = threshold

        [Range(1, 365)]
        public int LoanPeriodDays { get; set; } = 14;

        [Range(1, 20)]
        public int MaxBooksForInLibraryReading { get; set; } = 5;

        // Privileges
        public bool CanBorrowRareBooks { get; set; } = false;

        [Column(TypeName = "decimal(10,2)")]
        public decimal? YearlyFee { get; set; }
    }
}
