using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Payment
{
    public class PaymentRequestDto
    {
        [Required]
        public int MemberId { get; set; }

        [Required, Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [StringLength(50)]
        public string PaymentType { get; set; } = "Fine";   // default Fine, but can be MembershipFee

        [StringLength(50)]
        public string PaymentMethod { get; set; } = "Cash";

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
