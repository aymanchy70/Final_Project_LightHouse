using FinalProject_API.DTOs.BookEdition;
using FinalProject_API.DTOs.DigitalCopy;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using FinalProject_API.Services;
using Microsoft.AspNetCore.Mvc;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookEditionController : ControllerBase
    {
        private readonly IBookEditionRepository _editionRepo;
        private readonly IBookRepository _bookRepo;
        private readonly IPublisherRepository _publisherRepo;
        private readonly FileUploadService _fileUploadService;
        private readonly IDigitalCopyRepository _digitalCopyRepo;

        public BookEditionController(
            IBookEditionRepository editionRepo,
            IBookRepository bookRepo,
            IPublisherRepository publisherRepo,
            FileUploadService fileUploadService,
            IDigitalCopyRepository digitalCopyRepo)
        {
            _editionRepo = editionRepo;
            _bookRepo = bookRepo;
            _publisherRepo = publisherRepo;
            _fileUploadService = fileUploadService;
            _digitalCopyRepo = digitalCopyRepo;
        }

        // ========== Book Edition CRUD ==========

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookEditionResponseDto>>> GetEditions()
        {
            var editions = await _editionRepo.GetActiveEditionsAsync();
            return Ok(editions.Select(e => MapToResponse(e)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookEditionResponseDto>> GetEdition(int id)
        {
            var edition = await _editionRepo.GetEditionWithDetailsAsync(id);
            if (edition == null) return NotFound();
            return Ok(MapToResponse(edition));
        }

        [HttpGet("byBook/{bookId}")]
        public async Task<ActionResult<IEnumerable<BookEditionResponseDto>>> GetEditionsByBook(int bookId)
        {
            var editions = await _editionRepo.GetEditionsByBookAsync(bookId);
            return Ok(editions.Select(e => MapToResponse(e, includeBook: false)));
        }

        [HttpPost]
        public async Task<ActionResult<BookEditionResponseDto>> CreateEdition([FromForm] BookEditionRequestDto request)
        {
            var book = await _bookRepo.GetByIdAsync(request.BookId);
            if (book == null) return BadRequest($"Book with ID {request.BookId} does not exist.");

            if (await _editionRepo.IsDuplicateISBNAsync(request.ISBN))
                return Conflict($"ISBN '{request.ISBN}' already exists.");

            if (request.PublisherId.HasValue)
            {
                var publisher = await _publisherRepo.GetByIdAsync(request.PublisherId.Value);
                if (publisher == null) return BadRequest($"Publisher with ID {request.PublisherId} does not exist.");
            }

            string? coverImageUrl = request.CoverImageUrl;
            if (request.CoverImageFile != null)
            {
                try
                {
                    coverImageUrl = await _fileUploadService.UploadPhotoAsync(request.CoverImageFile, "bookeditions");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            var edition = new BookEdition
            {
                BookId = request.BookId,
                Edition = request.Edition,
                ISBN = request.ISBN,
                PublicationYear = request.PublicationYear,
                Language = request.Language,
                PageCount = request.PageCount,
                HasSoftCopy = request.HasSoftCopy,
                PaperType = request.PaperType,
                CoverType = request.CoverType,
                CoverImageUrl = coverImageUrl,
                Price = request.Price,
                PublisherId = request.PublisherId
            };

            await _editionRepo.AddAsync(edition);
            await _editionRepo.SaveChangesAsync();

            var created = await _editionRepo.GetEditionWithDetailsAsync(edition.BookEditionId);
            return CreatedAtAction(nameof(GetEdition), new { id = edition.BookEditionId }, MapToResponse(created!));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEdition(int id, [FromForm] BookEditionRequestDto request)
        {
            var existing = await _editionRepo.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var book = await _bookRepo.GetByIdAsync(request.BookId);
            if (book == null) return BadRequest($"Book with ID {request.BookId} not found.");

            if (await _editionRepo.IsDuplicateISBNAsync(request.ISBN, id))
                return Conflict($"ISBN '{request.ISBN}' already exists.");

            if (request.PublisherId.HasValue)
            {
                var publisher = await _publisherRepo.GetByIdAsync(request.PublisherId.Value);
                if (publisher == null) return BadRequest($"Publisher with ID {request.PublisherId} does not exist.");
            }

            if (request.CoverImageFile != null)
            {
                try
                {
                    existing.CoverImageUrl = await _fileUploadService.UploadPhotoAsync(request.CoverImageFile, "bookeditions");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
            {
                existing.CoverImageUrl = request.CoverImageUrl;
            }

            existing.BookId = request.BookId;
            existing.Edition = request.Edition;
            existing.ISBN = request.ISBN;
            existing.PublicationYear = request.PublicationYear;
            existing.Language = request.Language;
            existing.PageCount = request.PageCount;
            existing.HasSoftCopy = request.HasSoftCopy;
            existing.PaperType = request.PaperType;
            existing.CoverType = request.CoverType;
            existing.Price = request.Price;
            existing.PublisherId = request.PublisherId;
            existing.UpdatedDate = DateTime.Now;

            _editionRepo.Update(existing);
            await _editionRepo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEdition(int id)
        {
            var edition = await _editionRepo.GetByIdAsync(id);
            if (edition == null) return NotFound();

            _editionRepo.SoftDelete(edition);
            await _editionRepo.SaveChangesAsync();
            return NoContent();
        }

        // ========== Digital Copy Endpoints ==========

        [HttpPost("{editionId}/digitalcopy")]
        public async Task<ActionResult<DigitalCopyResponseDto>> UploadDigitalCopy(int editionId, IFormFile file)
        {
            var edition = await _editionRepo.GetByIdAsync(editionId);
            if (edition == null) return NotFound("Book edition not found.");

            var existing = await _digitalCopyRepo.GetByEditionAsync(editionId);
            if (existing != null)
            {
                var oldFullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existing.FilePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFullPath))
                    System.IO.File.Delete(oldFullPath);

                _digitalCopyRepo.Delete(existing);
            }

            string filePath;
            try
            {
                filePath = await _fileUploadService.UploadPdfAsync(file, "digitalcopies");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            var digitalCopy = new DigitalCopy
            {
                BookEditionId = editionId,
                FilePath = filePath,
                FileFormat = "PDF",
                FileSizeInMB = Math.Round(file.Length / (1024.0 * 1024.0), 2),
                UploadedAt = DateTime.Now,
                PreviewPages = 5
            };

            await _digitalCopyRepo.AddAsync(digitalCopy);
            await _digitalCopyRepo.SaveChangesAsync();

            var response = new DigitalCopyResponseDto
            {
                DigitalCopyId = digitalCopy.DigitalCopyId,
                BookEditionId = editionId,
                BookTitle = edition.Book?.Title,
                Edition = edition.Edition,
                FilePath = filePath,
                FileFormat = "PDF",
                FileSizeInMB = digitalCopy.FileSizeInMB,
                PreviewPages = digitalCopy.PreviewPages,
                UploadedAt = digitalCopy.UploadedAt
            };
            return Ok(response);
        }

        [HttpGet("{editionId}/digitalcopy")]
        public async Task<ActionResult<DigitalCopyResponseDto>> GetDigitalCopy(int editionId)
        {
            var dc = await _digitalCopyRepo.GetByEditionAsync(editionId);
            if (dc == null) return NotFound("No digital copy for this edition.");

            return Ok(new DigitalCopyResponseDto
            {
                DigitalCopyId = dc.DigitalCopyId,
                BookEditionId = dc.BookEditionId,
                BookTitle = dc.BookEdition?.Book?.Title,
                Edition = dc.BookEdition?.Edition,
                FilePath = dc.FilePath,
                FileFormat = dc.FileFormat,
                FileSizeInMB = dc.FileSizeInMB,
                PreviewPages = dc.PreviewPages,
                UploadedAt = dc.UploadedAt
            });
        }

        [HttpGet("{editionId}/digitalcopy/download")]
        public async Task<IActionResult> DownloadDigitalCopy(int editionId)
        {
            var dc = await _digitalCopyRepo.GetByEditionAsync(editionId);
            if (dc == null) return NotFound();

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", dc.FilePath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
                return NotFound("File missing on disk.");

            var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            return File(bytes, "application/pdf", $"{dc.BookEdition?.Book?.Title}_{dc.BookEdition?.Edition}.pdf");
        }
        [HttpGet("{editionId}/digitalcopy/preview")]
        public async Task<IActionResult> PreviewDigitalCopy(int editionId, [FromQuery] int? pages = null)
        {
            var dc = await _digitalCopyRepo.GetByEditionAsync(editionId);
            if (dc == null) return NotFound("No digital copy for this edition.");

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", dc.FilePath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
                return NotFound("File missing on disk.");

            int pagesToExtract = pages ?? 10;

            // Open the original PDF
            using var originalDocument = PdfReader.Open(fullPath, PdfDocumentOpenMode.Import);
            int totalPages = originalDocument.PageCount;
            int pagesToTake = Math.Min(pagesToExtract, totalPages);

            // If the source is short enough, return the original file
            if (totalPages <= pagesToTake)
            {
                return File(await System.IO.File.ReadAllBytesAsync(fullPath), "application/pdf");
            }

            // Create a new PDF with only the first pagesToTake pages
            using var outputDocument = new PdfDocument();
            for (int i = 0; i < pagesToTake; i++)
            {
                var page = originalDocument.Pages[i];
                outputDocument.AddPage(page);
            }

            // Save to a MemoryStream
            using var outputStream = new MemoryStream();
            outputDocument.Save(outputStream, false);
            return File(outputStream.ToArray(), "application/pdf");
        }
        [HttpDelete("{editionId}/digitalcopy")]
        public async Task<IActionResult> DeleteDigitalCopy(int editionId)
        {
            var dc = await _digitalCopyRepo.GetByEditionAsync(editionId);
            if (dc == null) return NotFound();

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", dc.FilePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _digitalCopyRepo.Delete(dc);
            await _digitalCopyRepo.SaveChangesAsync();
            return NoContent();
        }

        // ========== Mapping Helper ==========

        private BookEditionResponseDto MapToResponse(BookEdition edition, bool includeBook = true)
        {
            return new BookEditionResponseDto
            {
                BookEditionId = edition.BookEditionId,
                BookId = edition.BookId,
                BookTitle = includeBook ? edition.Book?.Title : null,
                Edition = edition.Edition,
                ISBN = edition.ISBN,
                PublicationYear = edition.PublicationYear,
                Language = edition.Language,
                PageCount = edition.PageCount,
                HasSoftCopy = edition.HasSoftCopy,
                PaperType = edition.PaperType,
                CoverType = edition.CoverType,
                CoverImageUrl = edition.CoverImageUrl,
                Price = edition.Price,
                PublisherId = edition.PublisherId,
                PublisherName = edition.Publisher?.Name,
                IsActive = edition.IsActive,
                CreatedDate = edition.CreatedDate,
                UpdatedDate = edition.UpdatedDate
            };
        }
    }
}
