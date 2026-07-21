namespace FinalProject_API.DTOs.DigitalCopy
{
    public class DigitalCopyResponseDto
    {
        public int DigitalCopyId { get; set; }
        public int BookEditionId { get; set; }
        public string? BookTitle { get; set; }
        public string? Edition { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileFormat { get; set; } = string.Empty;
        public double FileSizeInMB { get; set; }
        public int PreviewPages { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
