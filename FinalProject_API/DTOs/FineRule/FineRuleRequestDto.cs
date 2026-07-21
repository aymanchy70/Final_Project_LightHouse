using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.FineRule
{
    public class FineRuleRequestDto
    {
        [Required, StringLength(100)]
        public string RuleName { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string FineType { get; set; } = "PerDay";

        public decimal? FineAmount { get; set; }
        public decimal? FinePerDay { get; set; }
        public int? PercentageOfBookPrice { get; set; }
        public decimal? MaxFineAmount { get; set; }
        public int GracePeriodDays { get; set; } = 0;
    }
}
