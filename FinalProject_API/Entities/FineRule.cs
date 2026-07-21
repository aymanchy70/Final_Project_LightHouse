using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class FineRule : BaseEntity
    {
        [Key]
        public int FineRuleId { get; set; }

        [Required(ErrorMessage = "Rule name is required")]
        [StringLength(100)]
        public string RuleName { get; set; } = string.Empty; // e.g., "Late Return", "Lost Book", "Damage"

        [Required]
        [StringLength(50)]
        public string FineType { get; set; } = "PerDay"; // "Fixed", "PerDay", "Percentage"

        public decimal? FineAmount { get; set; }      // For Fixed
        public decimal? FinePerDay { get; set; }      // For PerDay
        public int? PercentageOfBookPrice { get; set; } // For Percentage

        public decimal? MaxFineAmount { get; set; }   // Cap

        public int GracePeriodDays { get; set; } = 0;  // Days before fine starts

        public bool IsActive { get; set; } = true;
    }
}
