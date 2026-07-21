using System.Security.Claims;
using FinalProject_API.DTOs.Member;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using FinalProject_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly IMemberRepository _memberRepo;
        private readonly IMembershipTypeRepository _membershipTypeRepo;
        private readonly UserManager<IdentityUser<int>> _userManager;
        private readonly FileUploadService _fileUploadService;
        private readonly IPaymentRepository _paymentRepo;

        public MemberController(
            IMemberRepository memberRepo,
            IMembershipTypeRepository membershipTypeRepo,
            UserManager<IdentityUser<int>> userManager,
            FileUploadService fileUploadService,
            IPaymentRepository paymentRepo)
        {
            _memberRepo = memberRepo;
            _membershipTypeRepo = membershipTypeRepo;
            _userManager = userManager;
            _fileUploadService = fileUploadService;
            _paymentRepo = paymentRepo;
        }

        // ── Admin CRUD ───────────────────────────────────────────────

        [HttpGet]
        [Authorize(Policy = "ManageMembers")]
        public async Task<ActionResult<IEnumerable<MemberResponseDto>>> GetAll()
        {
            var members = await _memberRepo.GetActiveMembersAsync();
            return Ok(members.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<ActionResult<MemberResponseDto>> GetById(int id)
        {
            var member = await _memberRepo.GetMemberWithDetailsAsync(id);
            if (member == null) return NotFound();
            return Ok(MapToResponse(member));
        }

        [HttpPost]
        [Authorize(Policy = "ManageMembers")]
        public async Task<ActionResult<MemberResponseDto>> Create([FromForm] MemberRequestDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId.ToString());
            if (user == null) return BadRequest("User not found.");

            if (await _memberRepo.IsUserAlreadyMemberAsync(dto.UserId))
                return Conflict("User is already a member.");

            var membershipType = await _membershipTypeRepo.GetByIdAsync(dto.MembershipTypeId);
            if (membershipType == null) return BadRequest("Invalid MembershipTypeId.");

            string? profilePicUrl = null;
            if (dto.ProfilePictureFile != null)
            {
                try
                {
                    profilePicUrl = await _fileUploadService.UploadPhotoAsync(dto.ProfilePictureFile, "members");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            var member = new Member
            {
                UserId = dto.UserId,
                FullName = dto.FullName,
                Address = dto.Address,
                Phone = dto.Phone,
                MembershipTypeId = dto.MembershipTypeId,
                MembershipStartDate = DateTime.Now,
                MembershipExpiryDate = dto.MembershipExpiryDate,
                MembershipStatus = dto.MembershipStatus,
                PaymentStatus = dto.PaymentStatus,
                ProfilePictureUrl = profilePicUrl
            };

            await _memberRepo.AddAsync(member);
            await _memberRepo.SaveChangesAsync();

            var created = await _memberRepo.GetMemberWithDetailsAsync(member.MemberId);
            return CreatedAtAction(nameof(GetById), new { id = member.MemberId }, MapToResponse(created!));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> Update(int id, [FromForm] MemberRequestDto dto)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();

            if (dto.UserId != member.UserId)
            {
                var user = await _userManager.FindByIdAsync(dto.UserId.ToString());
                if (user == null) return BadRequest("User not found.");
                if (await _memberRepo.IsUserAlreadyMemberAsync(dto.UserId))
                    return Conflict("User is already assigned to another member.");
            }

            var membershipType = await _membershipTypeRepo.GetByIdAsync(dto.MembershipTypeId);
            if (membershipType == null) return BadRequest("Invalid MembershipTypeId.");

            if (dto.ProfilePictureFile != null)
            {
                try
                {
                    member.ProfilePictureUrl = await _fileUploadService.UploadPhotoAsync(dto.ProfilePictureFile, "members");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            member.UserId = dto.UserId;
            member.FullName = dto.FullName;
            member.Address = dto.Address;
            member.Phone = dto.Phone;
            member.MembershipTypeId = dto.MembershipTypeId;
            member.MembershipExpiryDate = dto.MembershipExpiryDate;
            member.MembershipStatus = dto.MembershipStatus;
            member.PaymentStatus = dto.PaymentStatus;
            member.UpdatedDate = DateTime.Now;

            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> Delete(int id)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();
            _memberRepo.SoftDelete(member);
            await _memberRepo.SaveChangesAsync();
            return NoContent();
        }

        // ── Admin approval flow ───────────────────────────────────────

        [HttpPost("approve/{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> ApproveMember(int id)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();
            if (member.MembershipStatus != "PendingApproval")
                return BadRequest("Only pending applications can be approved.");

            member.MembershipStatus = "Approved";
            member.MembershipStartDate = DateTime.Now;
            member.UpdatedDate = DateTime.Now;

            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();
            return Ok(new { message = "Member approved." });
        }

        [HttpPost("reject/{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> RejectMember(int id)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();
            if (member.MembershipStatus != "PendingApproval")
                return BadRequest("Only pending applications can be rejected.");

            member.MembershipStatus = "Rejected";
            member.UpdatedDate = DateTime.Now;

            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();
            return Ok(new { message = "Member rejected." });
        }

        // ── User-facing membership actions (self‑service) ────────────

        [HttpPost("apply")]
        [Authorize]
        public async Task<ActionResult<MemberResponseDto>> ApplyForMembership([FromBody] MembershipApplicationDto application)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("User not logged in.");

            int userId = int.Parse(userIdClaim);

            var existingMember = await _memberRepo.GetByUserIdAsync(userId);
            if (existingMember != null &&
                existingMember.MembershipStatus != "Rejected" &&
                existingMember.MembershipStatus != "Cancelled")
                return Conflict("You already have an active membership or pending application.");

            var membershipType = await _membershipTypeRepo.GetByIdAsync(application.MembershipTypeId);
            if (membershipType == null) return BadRequest("Invalid membership type.");

            var user = await _userManager.FindByIdAsync(userId.ToString());
            string fullName = user?.Email ?? "Unknown";

            var member = new Member
            {
                UserId = userId,
                FullName = fullName,
                MembershipTypeId = application.MembershipTypeId,
                MembershipStatus = "PendingApproval",
                PaymentStatus = "Pending",
                MembershipStartDate = DateTime.Now,
            };

            await _memberRepo.AddAsync(member);
            await _memberRepo.SaveChangesAsync();

            var created = await _memberRepo.GetMemberWithDetailsAsync(member.MemberId);
            return Ok(MapToResponse(created!));
        }

        [HttpPost("join")]
        [Authorize]
        public async Task<ActionResult<MemberResponseDto>> JoinMembership([FromForm] JoinMembershipDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("User not logged in.");

            var existingMember = await _memberRepo.GetByUserIdAsync(userId);
            if (existingMember != null &&
                existingMember.MembershipStatus != "Rejected" &&
                existingMember.MembershipStatus != "Cancelled")
                return Conflict("You already have an active membership or pending application.");

            var membershipType = await _membershipTypeRepo.GetByIdAsync(dto.MembershipTypeId);
            if (membershipType == null) return BadRequest("Invalid membership type.");

            decimal yearlyFee = membershipType.YearlyFee ?? 0;

            string? profilePicUrl = null;
            if (dto.ProfilePictureFile != null)
            {
                try
                {
                    profilePicUrl = await _fileUploadService.UploadPhotoAsync(dto.ProfilePictureFile, "members");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            string fullName = dto.FullName?.Trim();
            if (string.IsNullOrEmpty(fullName))
                fullName = User.FindFirstValue("name") ?? User.FindFirstValue(ClaimTypes.Email) ?? "Unknown";

            Payment? payment = null;
            if (yearlyFee > 0)
            {
                payment = new Payment
                {
                    Amount = yearlyFee,
                    PaymentDate = DateTime.Now,
                    PaymentType = "MembershipFee",
                    PaymentMethod = dto.PaymentMethod ?? "Cash",
                    Notes = "Self‑service membership payment"
                };
            }

            var member = new Member
            {
                UserId = userId,
                FullName = fullName,
                Phone = dto.Phone,
                Address = dto.Address,
                ProfilePictureUrl = profilePicUrl,
                MembershipTypeId = dto.MembershipTypeId,
                MembershipStatus = "PendingApproval",
                PaymentStatus = (yearlyFee > 0) ? "Paid" : "NotRequired",
                MembershipStartDate = DateTime.Now,
                MembershipExpiryDate = (yearlyFee > 0) ? DateTime.Now.AddYears(1) : null,
                CreatedBy = "Self‑service"
            };

            await _memberRepo.AddAsync(member);
            await _memberRepo.SaveChangesAsync();

            if (payment != null)
            {
                payment.MemberId = member.MemberId;
                await _paymentRepo.AddAsync(payment);
                await _paymentRepo.SaveChangesAsync();
            }

            var created = await _memberRepo.GetMemberWithDetailsAsync(member.MemberId);
            return Ok(MapToResponse(created!));
        }

        [HttpGet("mystatus")]
        [Authorize]
        public async Task<ActionResult<MemberResponseDto>> GetMyMembershipStatus()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            int userId = int.Parse(userIdClaim);
            var member = await _memberRepo.GetByUserIdAsync(userId);
            if (member == null) return NotFound("You are not a member yet.");

            return Ok(MapToResponse(member));
        }

        [HttpPut("myprofile")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromForm] MemberSelfUpdateDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId);
            if (member == null) return NotFound("Member record not found.");

            member.FullName = dto.FullName ?? member.FullName;
            member.Address = dto.Address ?? member.Address;
            member.Phone = dto.Phone ?? member.Phone;

            if (dto.ProfilePictureFile != null)
            {
                try
                {
                    member.ProfilePictureUrl = await _fileUploadService.UploadPhotoAsync(dto.ProfilePictureFile, "members");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            member.UpdatedDate = DateTime.Now;
            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();

            return Ok(MapToResponse(member));
        }


        [HttpPost("upgrade")]
        [Authorize]
        public async Task<ActionResult<MemberResponseDto>> UpgradeMembership([FromBody] int newMembershipTypeId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("User not logged in.");

            var member = await _memberRepo.GetByUserIdAsync(userId);
            if (member == null) return NotFound("Member record not found.");
            if (member.MembershipStatus != "Approved")
                return BadRequest("Only approved members can upgrade.");

            if (newMembershipTypeId == member.MembershipTypeId)
                return BadRequest("You are already on this membership type.");

            var newType = await _membershipTypeRepo.GetByIdAsync(newMembershipTypeId);
            if (newType == null) return BadRequest("Invalid membership type.");

            decimal newFee = newType.YearlyFee ?? 0;

            // 1. Record payment if the new plan has a fee
            if (newFee > 0)
            {
                var payment = new Payment
                {
                    MemberId = member.MemberId,
                    Amount = newFee,
                    PaymentDate = DateTime.Now,
                    PaymentType = "MembershipFee",
                    PaymentMethod = "Cash",   // can be extended via DTO later
                    Notes = $"Upgrade to {newType.Name}"
                };
                await _paymentRepo.AddAsync(payment);
            }

            // 2. Update member
            member.MembershipTypeId = newMembershipTypeId;
            member.MembershipExpiryDate = DateTime.Now.AddYears(1);
            member.MembershipStatus = "Approved";
            member.IsBlocked = false;
            member.BlockReason = null;
            member.UpdatedDate = DateTime.Now;

            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();

            var updated = await _memberRepo.GetMemberWithDetailsAsync(member.MemberId);
            return Ok(MapToResponse(updated!));
        }


        [HttpPost("block/{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> BlockMember(int id, [FromBody] string? reason)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();

            member.IsBlocked = true;
            member.BlockReason = reason ?? "Blocked by admin";
            member.UpdatedDate = DateTime.Now;
            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();
            return Ok(new { message = "Member blocked." });
        }

        [HttpPost("unblock/{id}")]
        [Authorize(Policy = "ManageMembers")]
        public async Task<IActionResult> UnblockMember(int id)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            if (member == null) return NotFound();

            member.IsBlocked = false;
            member.BlockReason = null;
            member.UpdatedDate = DateTime.Now;
            _memberRepo.Update(member);
            await _memberRepo.SaveChangesAsync();
            return Ok(new { message = "Member unblocked." });
        }



        // ── Helper mapping ───────────────────────────────────────────

        private MemberResponseDto MapToResponse(Member member)
        {
            return new MemberResponseDto
            {
                MemberId = member.MemberId,
                UserId = member.UserId,
                FullName = member.FullName,
                Address = member.Address,
                Phone = member.Phone,
                MembershipTypeId = member.MembershipTypeId,
                MembershipTypeName = member.MembershipType?.Name,
                MembershipStartDate = member.MembershipStartDate,
                MembershipExpiryDate = member.MembershipExpiryDate,
                OutstandingFine = member.OutstandingFine,
                IsBlocked = member.IsBlocked,
                BlockReason = member.BlockReason,
                MembershipStatus = member.MembershipStatus,
                PaymentStatus = member.PaymentStatus,
                ProfilePictureUrl = member.ProfilePictureUrl,
                YearlyFee = member.MembershipType?.YearlyFee,
                IsActive = member.IsActive,
                CreatedDate = member.CreatedDate
            };
        }
    }
}