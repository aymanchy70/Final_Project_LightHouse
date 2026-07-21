using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Member : BaseEntity
    {
        [Key]
        public int MemberId { get; set; }

        [Required]
        public int UserId { get; set; }           // FK to IdentityUser<int>.Id

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Address { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(500)]
        public string? ProfilePictureUrl { get; set; }

        // Membership type
        [Required]
        public int MembershipTypeId { get; set; }

        public DateTime MembershipStartDate { get; set; } = DateTime.Now;
        public DateTime? MembershipExpiryDate { get; set; }

        // Fine tracking
        public decimal OutstandingFine { get; set; } = 0;

        // NEW: Approval and Payment Status
        [StringLength(20)]
        public string MembershipStatus { get; set; } = "PendingApproval";
        // Possible values: PendingApproval, Approved, Rejected, Expired, Cancelled

        [StringLength(20)]
        public string PaymentStatus { get; set; } = "Pending";
        // Possible values: Pending, Paid, Waived

        // Old block flag (kept for other admin actions)
        public bool IsBlocked { get; set; } = false;
        [StringLength(500)]
        public string? BlockReason { get; set; }

        // Navigation
        [ForeignKey(nameof(UserId))]
        public virtual IdentityUser<int>? IdentityUser { get; set; }

        [ForeignKey(nameof(MembershipTypeId))]
        public virtual MembershipType? MembershipType { get; set; }

        // Future navigation properties (BorrowingRecords etc.) can be added later    }

        public ICollection<BorrowingRecord> BorrowingRecords { get; set; } = new List<BorrowingRecord>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}