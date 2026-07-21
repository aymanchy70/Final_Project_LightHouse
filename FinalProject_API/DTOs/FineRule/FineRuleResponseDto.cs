namespace FinalProject_API.DTOs.FineRule
{
    public class FineRuleResponseDto
    {
        public int FineRuleId { get; set; }
        public string RuleName { get; set; } = string.Empty;
        public string FineType { get; set; } = string.Empty;
        public decimal? FineAmount { get; set; }
        public decimal? FinePerDay { get; set; }
        public int? PercentageOfBookPrice { get; set; }
        public decimal? MaxFineAmount { get; set; }
        public int GracePeriodDays { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
