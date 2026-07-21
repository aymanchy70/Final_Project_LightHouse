using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalProject_API.Entities;
using FinalProject_API.DTOs.Reservation;
using FinalProject_API.Repositories.Interfaces;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationRepository _reservationRepo;
        private readonly IMemberRepository _memberRepo;
        private readonly IPhysicalCopyRepository _copyRepo;

        public ReservationController(
            IReservationRepository reservationRepo,
            IMemberRepository memberRepo,
            IPhysicalCopyRepository copyRepo)
        {
            _reservationRepo = reservationRepo;
            _memberRepo = memberRepo;
            _copyRepo = copyRepo;
        }

        // ── Admin / librarian reserve on behalf of member ──
        [HttpPost("reserve")]
        [Authorize(Policy = "ManageReservations")]
        public async Task<ActionResult<ReservationResponseDto>> ReserveBook(ReserveRequestDto dto)
        {
            var member = await _memberRepo.GetByIdAsync(dto.MemberId);
            if (member == null) return BadRequest("Member not found.");
            if (member.MembershipStatus != "Approved") return BadRequest("Member is not approved.");

            var availableCopies = await _copyRepo.FindAsync(
                pc => pc.BookEditionId == dto.BookEditionId && pc.Status == "Available");
            if (availableCopies.Any()) return BadRequest("There are available copies. Please borrow directly.");

            if (await _reservationRepo.HasPendingReservationAsync(dto.MemberId, dto.BookEditionId))
                return Conflict("You already have a pending reservation for this book edition.");

            var reservation = new Reservation
            {
                MemberId = dto.MemberId,
                BookEditionId = dto.BookEditionId,
                ReservationDate = DateTime.Now,
                Status = "Pending"
            };

            await _reservationRepo.AddAsync(reservation);
            await _reservationRepo.SaveChangesAsync();

            var response = new ReservationResponseDto
            {
                ReservationId = reservation.ReservationId,
                MemberId = reservation.MemberId,
                MemberName = member.FullName,
                BookEditionId = reservation.BookEditionId,
                ReservationDate = reservation.ReservationDate,
                Status = reservation.Status
            };
            return Ok(response);
        }

        // ── Admin cancel any reservation ──
        [HttpPost("cancel/{id}")]
        [Authorize(Policy = "ManageReservations")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var reservation = await _reservationRepo.GetByIdAsync(id);
            if (reservation == null) return NotFound();
            if (reservation.Status != "Pending") return BadRequest("Only pending reservations can be cancelled.");

            reservation.Status = "Cancelled";
            reservation.UpdatedDate = DateTime.Now;
            _reservationRepo.Update(reservation);
            await _reservationRepo.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled." });
        }

        // ── Self‑service: reserve a book ──
        [HttpPost("reserve-self")]
        [Authorize]
        public async Task<ActionResult<ReservationResponseDto>> ReserveAsMember([FromBody] int bookEditionId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized("Invalid token.");

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found for your account.");

            var dto = new ReserveRequestDto { MemberId = member.MemberId, BookEditionId = bookEditionId };
            return await ReserveBook(dto);
        }

        // ── Self‑service: cancel my reservation ──
        // (We can reuse the same cancel endpoint, but let's add a dedicated self‑cancel)
        [HttpPost("cancel-self/{id}")]
        [Authorize]
        public async Task<IActionResult> CancelMyReservation(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            var reservation = await _reservationRepo.GetByIdAsync(id);
            if (reservation == null) return NotFound();
            if (reservation.MemberId != member.MemberId) return Forbid();
            if (reservation.Status != "Pending") return BadRequest("Only pending reservations can be cancelled.");

            reservation.Status = "Cancelled";
            reservation.UpdatedDate = DateTime.Now;
            _reservationRepo.Update(reservation);
            await _reservationRepo.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled." });
        }

        // ── Get member's own reservations ──
        [HttpGet("myreservations")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetMyReservations()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            var reservations = await _reservationRepo.GetActiveReservationsByMemberAsync(member.MemberId);
            var response = reservations.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                MemberId = r.MemberId,
                MemberName = member.FullName,
                BookEditionId = r.BookEditionId,
                BookTitle = r.BookEdition?.Book?.Title,
                Edition = r.BookEdition?.Edition,
                ReservationDate = r.ReservationDate,
                Status = r.Status,
                FulfilledAt = r.FulfilledAt
            });
            return Ok(response);
        }

        // ── Admin: get reservations of a specific member ──
        [HttpGet("member/{memberId}")]
        [Authorize(Policy = "ManageReservations")]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetMemberReservations(int memberId)
        {
            var reservations = await _reservationRepo.GetActiveReservationsByMemberAsync(memberId);
            var response = reservations.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                MemberId = r.MemberId,
                MemberName = r.Member?.FullName,
                BookEditionId = r.BookEditionId,
                BookTitle = r.BookEdition?.Book?.Title,
                Edition = r.BookEdition?.Edition,
                ReservationDate = r.ReservationDate,
                Status = r.Status,
                FulfilledAt = r.FulfilledAt
            });
            return Ok(response);
        }

        [HttpGet("all")]
        [Authorize(Policy = "ManageReservations")]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetAllReservations()
        {
            // Use the generic GetAllAsync from the repository
            var reservations = await _reservationRepo.GetAllAsync();
            var response = reservations.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                MemberId = r.MemberId,
                MemberName = r.Member?.FullName,
                BookEditionId = r.BookEditionId,
                BookTitle = r.BookEdition?.Book?.Title,
                Edition = r.BookEdition?.Edition,
                ReservationDate = r.ReservationDate,
                Status = r.Status,
                FulfilledAt = r.FulfilledAt
            });
            return Ok(response);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "ManageReservations")]
        public async Task<ActionResult<ReservationResponseDto>> GetReservation(int id)
        {
            var reservation = await _reservationRepo.GetByIdAsync(id);
            if (reservation == null) return NotFound();
            return Ok(new ReservationResponseDto
            {
                ReservationId = reservation.ReservationId,
                MemberId = reservation.MemberId,
                MemberName = reservation.Member?.FullName,
                BookEditionId = reservation.BookEditionId,
                BookTitle = reservation.BookEdition?.Book?.Title,
                Edition = reservation.BookEdition?.Edition,
                ReservationDate = reservation.ReservationDate,
                Status = reservation.Status,
                FulfilledAt = reservation.FulfilledAt
            });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }
    }
}