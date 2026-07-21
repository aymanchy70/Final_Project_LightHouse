using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Member
{
    public class MemberRequestDto
    {
        [Required]
        public int UserId { get; set; }

        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Address { get; set; }

        [Phone, StringLength(20)]
        public string? Phone { get; set; }
        public IFormFile? ProfilePictureFile { get; set; }

        [Required]
        public int MembershipTypeId { get; set; }

        public DateTime? MembershipExpiryDate { get; set; }

        // NEW
        [StringLength(20)]
        public string MembershipStatus { get; set; } = "PendingApproval";

        [StringLength(20)]
        public string PaymentStatus { get; set; } = "Pending";
    }
}
