using FinalProject_API.DTOs.Payment;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepo;
        private readonly IMemberRepository _memberRepo;
        private readonly IMembershipTypeRepository _membershipTypeRepo;

        public PaymentController(
            IPaymentRepository paymentRepo,
            IMemberRepository memberRepo,
            IMembershipTypeRepository membershipTypeRepo)
        {
            _paymentRepo = paymentRepo;
            _memberRepo = memberRepo;
            _membershipTypeRepo = membershipTypeRepo;
        }

        // GET: api/Payment/member/{memberId}
        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetMemberPayments(int memberId)
        {
            var payments = await _paymentRepo.GetPaymentsByMemberAsync(memberId);
            var response = payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                MemberId = p.MemberId,
                MemberName = p.Member?.FullName,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                Notes = p.Notes
            });
            return Ok(response);
        }

        // POST: api/Payment
        [HttpPost]
        public async Task<ActionResult<PaymentResponseDto>> RecordPayment(PaymentRequestDto dto)
        {
            // Validate member
            var member = await _memberRepo.GetByIdAsync(dto.MemberId);
            if (member == null) return BadRequest("Member not found.");

            if (dto.Amount <= 0) return BadRequest("Amount must be greater than zero.");

            // ----- Fine payment validation -----
            if (dto.PaymentType == "Fine" || string.IsNullOrWhiteSpace(dto.PaymentType))
            {
                if (dto.Amount > member.OutstandingFine)
                    return BadRequest($"Amount exceeds outstanding fine ({member.OutstandingFine}).");
            }

            // ----- Membership fee payment -----
            if (dto.PaymentType == "MembershipFee")
            {
                var membershipType = await _membershipTypeRepo.GetByIdAsync(member.MembershipTypeId);
                if (membershipType == null || membershipType.YearlyFee == null)
                    return BadRequest("This membership type does not have a defined yearly fee.");

                if (dto.Amount != membershipType.YearlyFee.Value)
                    return BadRequest($"Amount must equal the yearly fee ({membershipType.YearlyFee}).");
            }

            // Create the payment record
            var payment = new Payment
            {
                MemberId = dto.MemberId,
                Amount = dto.Amount,
                PaymentDate = DateTime.Now,
                PaymentType = dto.PaymentType ?? "Fine",
                PaymentMethod = dto.PaymentMethod ?? "Cash",
                Notes = dto.Notes
            };

            await _paymentRepo.AddAsync(payment);

            // ----- Reduce outstanding fine (if applicable) -----
            if (dto.PaymentType == "Fine" || string.IsNullOrWhiteSpace(dto.PaymentType))
            {
                member.OutstandingFine -= dto.Amount;
            }

            // ----- Extend membership if it's a membership fee payment -----
            if (dto.PaymentType == "MembershipFee")
            {
                // Extend expiry by one year from current expiry (or today if expired)
                var baseline = member.MembershipExpiryDate > DateTime.Now
                                    ? member.MembershipExpiryDate.Value
                                    : DateTime.Now;
                member.MembershipExpiryDate = baseline.AddYears(1);

                // If the member was pending approval, automatically approve them (optional)
                if (member.MembershipStatus == "PendingApproval")
                    member.MembershipStatus = "Approved";

                // Ensure the member is not blocked
                member.IsBlocked = false;
                member.BlockReason = null;
            }

            member.UpdatedDate = DateTime.Now;
            _memberRepo.Update(member);

            await _paymentRepo.SaveChangesAsync();

            var response = new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                MemberId = payment.MemberId,
                MemberName = member.FullName,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                PaymentType = payment.PaymentType,
                PaymentMethod = payment.PaymentMethod,
                Notes = payment.Notes
            };

            return Ok(response);
        }

        [HttpPost("pay")]
        [Authorize]
        public async Task<ActionResult<PaymentResponseDto>> PayAsMember([FromBody] SelfPaymentDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId);
            if (member == null) return NotFound("Member record not found.");

            if (dto.Amount <= 0) return BadRequest("Amount must be greater than zero.");

            // ---- Fine payment ----
            if (dto.PaymentType == "Fine")
            {
                if (dto.Amount > member.OutstandingFine)
                    return BadRequest($"Amount exceeds outstanding fine ({member.OutstandingFine}).");
            }
            // ---- Membership fee ----
            else if (dto.PaymentType == "MembershipFee")
            {
                var membershipType = await _membershipTypeRepo.GetByIdAsync(member.MembershipTypeId);
                if (membershipType == null || membershipType.YearlyFee == null)
                    return BadRequest("Your membership type does not have a defined yearly fee.");

                if (dto.Amount != membershipType.YearlyFee.Value)
                    return BadRequest($"Amount must equal the yearly fee ({membershipType.YearlyFee}).");

                // Extend membership expiry by one year
                var baseline = member.MembershipExpiryDate > DateTime.Now
                                    ? member.MembershipExpiryDate.Value
                                    : DateTime.Now;
                member.MembershipExpiryDate = baseline.AddYears(1);

                // Auto-approve if pending
                if (member.MembershipStatus == "PendingApproval")
                    member.MembershipStatus = "Approved";

                member.IsBlocked = false;
                member.BlockReason = null;
                member.UpdatedDate = DateTime.Now;
                _memberRepo.Update(member);
            }
            else
            {
                return BadRequest("Invalid payment type. Use 'Fine' or 'MembershipFee'.");
            }

            var payment = new Payment
            {
                MemberId = member.MemberId,
                Amount = dto.Amount,
                PaymentDate = DateTime.Now,
                PaymentType = dto.PaymentType,
                PaymentMethod = dto.PaymentMethod ?? "Cash",
                Notes = dto.Notes
            };

            await _paymentRepo.AddAsync(payment);

            // Only reduce fine for fine payments
            if (dto.PaymentType == "Fine")
            {
                member.OutstandingFine -= dto.Amount;
                member.UpdatedDate = DateTime.Now;
                _memberRepo.Update(member);
            }

            await _paymentRepo.SaveChangesAsync();

            return Ok(new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                MemberId = member.MemberId,
                MemberName = member.FullName,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                PaymentType = payment.PaymentType,
                PaymentMethod = payment.PaymentMethod,
                Notes = payment.Notes
            });
        }


        [HttpGet]
        [Authorize(Policy = "ManagePayments")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetAllPayments()
        {
            var payments = await _paymentRepo.GetAllAsync();
            var response = payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                MemberId = p.MemberId,
                MemberName = p.Member?.FullName,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentType = p.PaymentType,
                PaymentMethod = p.PaymentMethod,
                Notes = p.Notes
            });
            return Ok(response);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "ManagePayments")]
        public async Task<ActionResult<PaymentResponseDto>> GetPayment(int id)
        {
            var payment = await _paymentRepo.GetByIdAsync(id);
            if (payment == null) return NotFound();
            return Ok(new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                MemberId = payment.MemberId,
                MemberName = payment.Member?.FullName,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                PaymentType = payment.PaymentType,
                PaymentMethod = payment.PaymentMethod,
                Notes = payment.Notes
            });
        }
    }
}
