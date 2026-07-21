using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.PhysicalCopy
{
    public class BulkShelveRequestDto
    {
        [Required]
        public List<int> CopyIds { get; set; } = new();

        [Required]
        public int ShelfId { get; set; }
    }
}
