using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Member
{
    public class MemberSelfUpdateDto
    {
        [StringLength(100)]
        public string? FullName { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        [Phone, StringLength(20)]
        public string? Phone { get; set; }

        public IFormFile? ProfilePictureFile { get; set; }
    }
}
