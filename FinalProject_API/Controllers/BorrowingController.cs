using FinalProject_API.Data;
using FinalProject_API.DTOs.Borrowing;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BorrowingController : ControllerBase
    {
        private readonly IBorrowingRepository _borrowingRepo;
        private readonly IMemberRepository _memberRepo;
        private readonly IPhysicalCopyRepository _copyRepo;
        private readonly IFineRuleRepository _fineRuleRepo;
        private readonly IReservationRepository _reservationRepo;
        private readonly AppDbContext _context;                         // NEW



        public BorrowingController(
            IBorrowingRepository borrowingRepo,
            IMemberRepository memberRepo,
            IPhysicalCopyRepository copyRepo,
            IFineRuleRepository fineRuleRepo,
            IReservationRepository reservationRepo,
            AppDbContext context)
        {
            _borrowingRepo = borrowingRepo;
            _memberRepo = memberRepo;
            _copyRepo = copyRepo;
            _fineRuleRepo = fineRuleRepo;
            _reservationRepo = reservationRepo;
            _context = context;
        }

        [HttpPost("request")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<BorrowingResponseDto>> RequestBook(IssueBookRequestDto dto)
        {
            var member = await _memberRepo.GetMemberWithDetailsAsync(dto.MemberId);
            if (member == null) return BadRequest("Member not found.");
            if (member.MembershipStatus != "Approved") return BadRequest("Member is not approved.");
            if (member.IsBlocked) return BadRequest("Member is blocked.");

            var membershipType = member.MembershipType;
            if (membershipType?.MaxOutstandingFine.HasValue == true)
            {
                if (member.OutstandingFine > membershipType.MaxOutstandingFine.Value)
                    return BadRequest($"Member's outstanding fine ({member.OutstandingFine}) exceeds allowed limit ({membershipType.MaxOutstandingFine}).");
            }

            // Fetch physical copy WITH its BookEdition → Book
            var copy = await _context.PhysicalCopies
                .Include(pc => pc.BookEdition)
                    .ThenInclude(be => be!.Book)
                .FirstOrDefaultAsync(pc => pc.PhysicalCopyId == dto.PhysicalCopyId);

            if (copy == null) return BadRequest("Physical copy not found.");
            if (copy.Status != "Available") return BadRequest("This copy is not available.");
            if (copy.IsReference) return BadRequest("Reference books cannot be borrowed.");

            var book = copy.BookEdition?.Book;
            if (book?.IsRareBook == true && membershipType?.CanBorrowRareBooks != true)
                return BadRequest("Member does not have permission to borrow rare books.");

            // Prevent duplicate borrowing for the same book
            if (book?.BookId != null)
            {
                if (await _borrowingRepo.HasActiveBorrowingForBookAsync(dto.MemberId, book.BookId))
                    return BadRequest("You already have an active borrowing for this book.");
            }

            int activeBorrowings = await _borrowingRepo.GetActiveBorrowingCountAsync(dto.MemberId);
            int maxBooks = membershipType?.MaxBooksCanBorrow ?? 5;
            if (activeBorrowings >= maxBooks)
                return BadRequest($"Member has reached the maximum number of borrowed/requested books ({maxBooks}).");

            var borrowing = new BorrowingRecord
            {
                MemberId = dto.MemberId,
                PhysicalCopyId = dto.PhysicalCopyId,
                IsDigital = false,
                RequestedDate = DateTime.Now,
                Status = "Pending"
            };
            await _borrowingRepo.AddAsync(borrowing);

            copy.Status = "Requested";
            copy.UpdatedDate = DateTime.Now;
            _copyRepo.Update(copy);

            await _borrowingRepo.SaveChangesAsync();

            var result = await _borrowingRepo.GetBorrowingWithDetailsAsync(borrowing.BorrowingId);
            return Ok(MapToResponse(result!));
        }        // ── Admin approves a pending request
        [HttpPost("approve/{id}")]
        [Authorize(Policy = "ApproveBorrowings")]
        public async Task<ActionResult<BorrowingResponseDto>> ApproveBorrowing(int id)
        {
            var borrowing = await _borrowingRepo.GetBorrowingWithDetailsAsync(id);
            if (borrowing == null) return NotFound("Borrowing request not found.");
            if (borrowing.Status != "Pending") return BadRequest("Only pending requests can be approved.");

            var member = await _memberRepo.GetMemberWithDetailsAsync(borrowing.MemberId);
            if (member == null || member.MembershipStatus != "Approved" || member.IsBlocked)
                return BadRequest("Member is not eligible.");

            borrowing.IssueDate = DateTime.Now;
            int loanDays = member.MembershipType?.LoanPeriodDays ?? 14;
            borrowing.DueDate = borrowing.IssueDate.Value.AddDays(loanDays);
            borrowing.Status = "Borrowed";
            borrowing.UpdatedDate = DateTime.Now;

            var copy = borrowing.PhysicalCopy;
            if (copy != null)
            {
                copy.Status = "Borrowed";
                copy.CheckedOutCount++;
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            _borrowingRepo.Update(borrowing);
            await _borrowingRepo.SaveChangesAsync();
            return Ok(MapToResponse(borrowing));
        }

        // ── Admin rejects a pending request
        [HttpPost("reject/{id}")]
        [Authorize(Policy = "ApproveBorrowings")]
        public async Task<IActionResult> RejectBorrowing(int id)
        {
            var borrowing = await _borrowingRepo.GetByIdAsync(id);
            if (borrowing == null) return NotFound("Borrowing request not found.");
            if (borrowing.Status != "Pending") return BadRequest("Only pending requests can be rejected.");

            borrowing.Status = "Rejected";
            borrowing.UpdatedDate = DateTime.Now;

            var copy = await _copyRepo.GetByIdAsync(borrowing.PhysicalCopyId);
            if (copy != null)
            {
                copy.Status = "Available";
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            _borrowingRepo.Update(borrowing);
            await _borrowingRepo.SaveChangesAsync();
            return Ok(new { message = "Borrowing request rejected." });
        }

        // ── Return a book
        [HttpPost("return/{id}")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<BorrowingResponseDto>> ReturnBook(int id, [FromBody] ReturnBookDto? dto)
        {
            var borrowing = await _borrowingRepo.GetBorrowingWithDetailsAsync(id);
            if (borrowing == null) return NotFound("Borrowing record not found.");
            if (borrowing.Status == "Returned" || borrowing.Status == "Lost")
                return BadRequest($"Book is already {borrowing.Status}.");

            borrowing.ReturnDate = DateTime.Now;
            borrowing.Status = "Returned";
            borrowing.Notes = dto?.Notes ?? borrowing.Notes;
            borrowing.UpdatedDate = DateTime.Now;

            // Fine calculation (LateReturn rule)
            var fineRule = await _fineRuleRepo.GetByRuleNameAsync("LateReturn");
            if (fineRule != null && fineRule.IsActive && borrowing.DueDate.HasValue)
            {
                int overdueDays = (int)(DateTime.Now - borrowing.DueDate.Value).TotalDays;
                if (overdueDays > 0)
                {
                    int graceDays = fineRule.GracePeriodDays;
                    overdueDays = Math.Max(0, overdueDays - graceDays);
                    if (overdueDays > 0)
                    {
                        decimal fine = 0;
                        switch (fineRule.FineType)
                        {
                            case "PerDay":
                                fine = (fineRule.FinePerDay ?? 0) * overdueDays;
                                break;
                            case "Fixed":
                                fine = fineRule.FineAmount ?? 0;
                                break;
                            case "Percentage":
                                decimal? bookPrice = borrowing.PhysicalCopy?.AcquiredCost ?? borrowing.PhysicalCopy?.BookEdition?.Price;
                                fine = (fineRule.PercentageOfBookPrice ?? 0) / 100m * (bookPrice ?? 0);
                                break;
                        }
                        if (fineRule.MaxFineAmount.HasValue && fine > fineRule.MaxFineAmount.Value)
                            fine = fineRule.MaxFineAmount.Value;

                        borrowing.FineAmount = fine;
                        var member = borrowing.Member;
                        if (member != null)
                        {
                            member.OutstandingFine += fine;
                            member.UpdatedDate = DateTime.Now;
                            _memberRepo.Update(member);
                        }
                    }
                }
            }

            // Update copy status, check for reservations
            var copy = borrowing.PhysicalCopy;
            if (copy != null)
            {
                var reservation = await _reservationRepo.GetOldestPendingReservationForEditionAsync(copy.BookEditionId);
                if (reservation != null)
                {
                    reservation.Status = "Fulfilled";
                    reservation.FulfilledAt = DateTime.Now;
                    _reservationRepo.Update(reservation);
                    copy.Status = "Reserved";
                }
                else
                {
                    copy.Status = "Available";
                }
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            _borrowingRepo.Update(borrowing);
            await _borrowingRepo.SaveChangesAsync();
            return Ok(MapToResponse(borrowing));
        }

        // ── Lost/Damaged book
        [HttpPost("lost/{id}")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<BorrowingResponseDto>> MarkLost(int id, [FromBody] LostBookDto dto)
        {
            var borrowing = await _borrowingRepo.GetBorrowingWithDetailsAsync(id);
            if (borrowing == null) return NotFound();
            if (borrowing.Status == "Returned" || borrowing.Status == "Lost" || borrowing.Status == "Damaged")
                return BadRequest($"Book is already {borrowing.Status}.");

            string ruleName = dto.LossType == "Damaged" ? "DamagedBook" : "LostBook";
            var fineRule = await _fineRuleRepo.GetByRuleNameAsync(ruleName);
            if (fineRule == null) return BadRequest($"Fine rule '{ruleName}' not found.");

            decimal fine = 0;
            var copy = borrowing.PhysicalCopy;
            decimal? bookPrice = copy?.AcquiredCost ?? copy?.BookEdition?.Price;

            switch (fineRule.FineType)
            {
                case "Fixed":
                    fine = fineRule.FineAmount ?? 0;
                    break;
                case "PerDay":
                    int days = (int)(DateTime.Now - borrowing.IssueDate!.Value).TotalDays;
                    fine = (fineRule.FinePerDay ?? 0) * days;
                    break;
                case "Percentage":
                    fine = (fineRule.PercentageOfBookPrice ?? 0) / 100m * (bookPrice ?? 0);
                    break;
            }
            if (fineRule.MaxFineAmount.HasValue && fine > fineRule.MaxFineAmount.Value)
                fine = fineRule.MaxFineAmount.Value;

            borrowing.Status = dto.LossType;
            borrowing.FineAmount = fine;
            borrowing.ReturnDate = DateTime.Now;
            borrowing.Notes = (borrowing.Notes ?? "") + $" | {dto.LossType}: {dto.LossReason}";
            borrowing.UpdatedDate = DateTime.Now;

            if (copy != null)
            {
                copy.Status = dto.LossType;
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            var member = borrowing.Member;
            if (member != null)
            {
                member.OutstandingFine += fine;
                _memberRepo.Update(member);
            }

            _borrowingRepo.Update(borrowing);
            await _borrowingRepo.SaveChangesAsync();
            return Ok(MapToResponse(borrowing));
        }

        // ── Update overdue statuses
        [HttpPost("update-overdue")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<IActionResult> UpdateOverdue()
        {
            await _borrowingRepo.UpdateOverdueStatusesAsync();
            return Ok(new { message = "Overdue statuses updated." });
        }

        // ── Pickup reserved copy (admin)
        [HttpPost("pickup-reserved/{physicalCopyId}")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<BorrowingResponseDto>> PickupReserved(int physicalCopyId, [FromBody] int memberId)
        {
            var member = await _memberRepo.GetMemberWithDetailsAsync(memberId);
            if (member == null) return BadRequest("Member not found.");
            if (member.MembershipStatus != "Approved") return BadRequest("Member not approved.");
            if (member.IsBlocked) return BadRequest("Member is blocked.");

            var copy = await _copyRepo.GetByIdAsync(physicalCopyId);
            if (copy == null) return BadRequest("Physical copy not found.");
            if (copy.Status != "Reserved") return BadRequest("Copy is not reserved.");

            int loanDays = member.MembershipType?.LoanPeriodDays ?? 14;
            var now = DateTime.Now;

            var borrowing = new BorrowingRecord
            {
                MemberId = memberId,
                PhysicalCopyId = physicalCopyId,
                RequestedDate = now,
                IssueDate = now,
                DueDate = now.AddDays(loanDays),
                Status = "Borrowed"
            };

            await _borrowingRepo.AddAsync(borrowing);

            copy.Status = "Borrowed";
            copy.CheckedOutCount++;
            copy.UpdatedDate = DateTime.Now;
            _copyRepo.Update(copy);

            await _borrowingRepo.SaveChangesAsync();

            var result = await _borrowingRepo.GetBorrowingWithDetailsAsync(borrowing.BorrowingId);
            return Ok(MapToResponse(result!));
        }

        // ── Self‑service pickup of reserved copy
        [HttpPost("pickup-reserved-self/{physicalCopyId}")]
        [Authorize]
        public async Task<ActionResult<BorrowingResponseDto>> PickupReservedSelf(int physicalCopyId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            return await PickupReserved(physicalCopyId, member.MemberId);
        }

        // ── Get member's own borrowings
        [HttpGet("myborrowings")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BorrowingResponseDto>>> GetMyBorrowings()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            var borrowings = await _borrowingRepo.GetAllBorrowingsByMemberAsync(member.MemberId); return Ok(borrowings.Select(MapToResponse));
        }

        // ── Self‑service borrow request
        [HttpPost("borrow")]
        [Authorize]
        public async Task<ActionResult<BorrowingResponseDto>> BorrowAsMember([FromBody] int physicalCopyId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            var dto = new IssueBookRequestDto { MemberId = member.MemberId, PhysicalCopyId = physicalCopyId };
            return await RequestBook(dto);
        }

        // ── Admin: get all pending requests
        [HttpGet("pending")]
        [Authorize(Policy = "ApproveBorrowings")]
        public async Task<ActionResult<IEnumerable<BorrowingResponseDto>>> GetPendingRequests()
        {
            var requests = await _borrowingRepo.GetPendingRequestsAsync();
            return Ok(requests.Select(MapToResponse));
        }

        // ── Member's borrowings (admin)
        [HttpGet("member/{memberId}")]
        [Authorize(Policy = "ManagePhysicalCopies")]   // changed from "ManageMembers"
        public async Task<ActionResult<IEnumerable<BorrowingResponseDto>>> GetMemberBorrowings(
            int memberId,
            [FromQuery] string? status = null)        // optional filter
        {
            var all = await _borrowingRepo.GetActiveBorrowingsByMemberAsync(memberId);
            IEnumerable<BorrowingRecord> result = all;

            if (!string.IsNullOrWhiteSpace(status))
            {
                result = status.ToLower() switch
                {
                    "active" => all.Where(br => br.Status == "Borrowed" || br.Status == "Overdue"),
                    "returned" => all.Where(br => br.Status == "Returned"),
                    _ => all
                };
            }

            return Ok(result.Select(MapToResponse));
        }
        [HttpPost("lost-self/{id}")]
        [Authorize]
        public async Task<ActionResult<BorrowingResponseDto>> MarkLostSelf(int id, [FromBody] LostBookDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            var borrowing = await _borrowingRepo.GetBorrowingWithDetailsAsync(id);
            if (borrowing == null) return NotFound("Borrowing record not found.");
            if (borrowing.MemberId != member.MemberId)
                return Forbid("You can only report your own books.");
            if (borrowing.Status == "Returned" || borrowing.Status == "Lost" || borrowing.Status == "Damaged")
                return BadRequest($"Book is already {borrowing.Status}.");

            string ruleName = dto.LossType == "Damaged" ? "DamagedBook" : "LostBook";
            var fineRule = await _fineRuleRepo.GetByRuleNameAsync(ruleName);
            if (fineRule == null) return BadRequest($"Fine rule '{ruleName}' not found.");

            decimal fine = 0;
            var copy = borrowing.PhysicalCopy;
            decimal? bookPrice = copy?.AcquiredCost ?? copy?.BookEdition?.Price;

            switch (fineRule.FineType)
            {
                case "Fixed":
                    fine = fineRule.FineAmount ?? 0;
                    break;
                case "PerDay":
                    int days = (int)(DateTime.Now - (borrowing.IssueDate ?? borrowing.RequestedDate)).TotalDays;
                    fine = (fineRule.FinePerDay ?? 0) * days;
                    break;
                case "Percentage":
                    fine = (fineRule.PercentageOfBookPrice ?? 0) / 100m * (bookPrice ?? 0);
                    break;
            }
            if (fineRule.MaxFineAmount.HasValue && fine > fineRule.MaxFineAmount.Value)
                fine = fineRule.MaxFineAmount.Value;

            borrowing.Status = dto.LossType;
            borrowing.FineAmount = fine;
            borrowing.ReturnDate = DateTime.Now;
            borrowing.Notes = (borrowing.Notes ?? "") + $" | Self‑reported {dto.LossType}: {dto.LossReason}";
            borrowing.UpdatedDate = DateTime.Now;

            if (copy != null)
            {
                copy.Status = dto.LossType;
                copy.UpdatedDate = DateTime.Now;
                _copyRepo.Update(copy);
            }

            member.OutstandingFine += fine;
            _memberRepo.Update(member);

            _borrowingRepo.Update(borrowing);
            await _borrowingRepo.SaveChangesAsync();

            return Ok(MapToResponse(borrowing));
        }

        [HttpGet("all-active")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<IEnumerable<BorrowingResponseDto>>> GetAllActiveBorrowings()
        {
            var borrowings = await _borrowingRepo.GetAllActiveBorrowingsAsync();
            return Ok(borrowings.Select(MapToResponse));
        }

        // ── Private helper mapping
        private BorrowingResponseDto MapToResponse(BorrowingRecord br)
        {
            return new BorrowingResponseDto
            {
                BorrowingId = br.BorrowingId,
                MemberId = br.MemberId,
                MemberName = br.Member?.FullName,
                PhysicalCopyId = br.PhysicalCopyId,
                BookTitle = br.PhysicalCopy?.BookEdition?.Book?.Title,
                Barcode = br.PhysicalCopy?.Barcode,
                RequestedDate = br.RequestedDate,
                IsDigital = br.IsDigital,
                IssueDate = br.IssueDate,
                DueDate = br.DueDate,
                ReturnDate = br.ReturnDate,
                Status = br.Status,
                FineAmount = br.FineAmount,
                FinePaid = br.FinePaid
            };
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "ManagePhysicalCopies")]
        public async Task<ActionResult<BorrowingResponseDto>> GetBorrowing(int id)
        {
            var borrowing = await _borrowingRepo.GetBorrowingWithDetailsAsync(id);
            if (borrowing == null) return NotFound();
            return Ok(MapToResponse(borrowing));
        }

        [HttpPost("request-digital")]
        [Authorize]
        public async Task<ActionResult<BorrowingResponseDto>> RequestDigitalBook([FromBody] DigitalBorrowRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");
            if (member.MembershipStatus != "Approved") return BadRequest("Member is not approved.");
            if (member.IsBlocked) return BadRequest("Member is blocked.");

            var membershipType = member.MembershipType;
            if (membershipType?.MaxOutstandingFine.HasValue == true)
            {
                if (member.OutstandingFine > membershipType.MaxOutstandingFine.Value)
                    return BadRequest($"Your outstanding fine ({member.OutstandingFine}) exceeds allowed limit.");
            }

            var digitalCopy = await _context.DigitalCopies
                .Include(dc => dc.BookEdition)
                    .ThenInclude(be => be!.Book)
                .FirstOrDefaultAsync(dc => dc.DigitalCopyId == dto.DigitalCopyId);

            if (digitalCopy == null || !digitalCopy.IsActive)
                return BadRequest("Digital copy not found or unavailable.");

            var book = digitalCopy.BookEdition?.Book;
            if (book == null) return BadRequest("Invalid digital copy.");

            if (await _borrowingRepo.HasActiveBorrowingForBookAsync(member.MemberId, book.BookId))
                return BadRequest("You already have an active borrowing for this book.");

            int activeBorrowings = await _borrowingRepo.GetActiveBorrowingCountAsync(member.MemberId);
            int maxBooks = membershipType?.MaxBooksCanBorrow ?? 5;
            if (activeBorrowings >= maxBooks)
                return BadRequest($"You have reached the maximum number of borrowings ({maxBooks}).");

            var borrowing = new BorrowingRecord
            {
                MemberId = member.MemberId,
                DigitalCopyId = dto.DigitalCopyId,
                IsDigital = true,
                RequestedDate = DateTime.Now,
                Status = "Pending"
            };

            await _borrowingRepo.AddAsync(borrowing);
            await _borrowingRepo.SaveChangesAsync();

            var result = await _borrowingRepo.GetBorrowingWithDetailsAsync(borrowing.BorrowingId);
            return Ok(MapToResponse(result!));
        }
        [HttpGet("my-active-bookids")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<int>>> GetMyActiveBorrowedBookIds()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var member = await _memberRepo.GetByUserIdAsync(userId.Value);
            if (member == null) return NotFound("Member record not found.");

            // Get all borrowings that are not returned/rejected/lost
            var activeBorrowings = await _borrowingRepo.FindAsync(br =>
                br.MemberId == member.MemberId &&
                br.Status != "Returned" && br.Status != "Rejected" &&
                br.Status != "Lost" && br.Status != "Damaged" &&
                br.IsActive);

            // Extract the BookId from the related physical copy or digital copy
            var bookIds = new List<int>();
            foreach (var br in activeBorrowings)
            {
                if (br.PhysicalCopy != null)
                {
                    var bookId = br.PhysicalCopy.BookEdition?.BookId;
                    if (bookId.HasValue) bookIds.Add(bookId.Value);
                }
                else if (br.DigitalCopy != null)
                {
                    var bookId = br.DigitalCopy.BookEdition?.BookId;
                    if (bookId.HasValue) bookIds.Add(bookId.Value);
                }
                // If both are null, skip (shouldn't happen)
            }

            return Ok(bookIds.Distinct());
        }
    }
}