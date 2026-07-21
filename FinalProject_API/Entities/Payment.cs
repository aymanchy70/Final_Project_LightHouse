using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Payment : BaseEntity
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.Now;
        [StringLength(50)]
        public string PaymentType { get; set; } = "Fine";   // "Fine", "MembershipFee"

        [StringLength(50)]
        public string PaymentMethod { get; set; } = "Cash";   // Cash, Card, Online

        [StringLength(500)]
        public string? Notes { get; set; }

        [ForeignKey(nameof(MemberId))]
        public virtual Member? Member { get; set; }
    }
}
