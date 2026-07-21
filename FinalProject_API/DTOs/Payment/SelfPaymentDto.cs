using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Payment
{
    public class SelfPaymentDto
    {
        [Required, Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [StringLength(50)]
        public string? PaymentMethod { get; set; } = "Cash";

        [StringLength(50)]
        public string? PaymentType { get; set; } = "Fine";   // "Fine" or "MembershipFee"

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
