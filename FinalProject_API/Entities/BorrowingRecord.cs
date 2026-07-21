using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class BorrowingRecord : BaseEntity
    {
        [Key]
        public int BorrowingId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public int PhysicalCopyId { get; set; }

        public DateTime RequestedDate { get; set; } = DateTime.Now; // new

        public DateTime? IssueDate { get; set; }           // nullable now
        public DateTime? DueDate { get; set; }             // nullable now

        public DateTime? ReturnDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Borrowed";   // Borrowed, Returned, Overdue, Lost

        [Column(TypeName = "decimal(10,2)")]
        public decimal? FineAmount { get; set; }

        public bool FinePaid { get; set; } = false;

        [StringLength(500)]
        public string? Notes { get; set; }

        // Future: IssuedByOperatorId, etc.

        [ForeignKey(nameof(MemberId))]
        public virtual Member? Member { get; set; }

        [ForeignKey(nameof(PhysicalCopyId))]
        public virtual PhysicalCopy? PhysicalCopy { get; set; }

        public int? DigitalCopyId { get; set; }

        public bool IsDigital { get; set; } = false;

        [ForeignKey(nameof(DigitalCopyId))]
        public virtual DigitalCopy? DigitalCopy { get; set; }
    }
}
