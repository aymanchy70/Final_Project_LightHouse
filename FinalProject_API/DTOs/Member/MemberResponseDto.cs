namespace FinalProject_API.DTOs.Member
{
    public class MemberResponseDto
    {
        public int MemberId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public int MembershipTypeId { get; set; }
        public string? MembershipTypeName { get; set; }
        public DateTime MembershipStartDate { get; set; }
        public DateTime? MembershipExpiryDate { get; set; }
        public decimal OutstandingFine { get; set; }
        public decimal? YearlyFee { get; set; }

        public string MembershipStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public bool IsBlocked { get; set; }
        public string? BlockReason { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
