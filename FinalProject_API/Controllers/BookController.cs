using FinalProject_API.Data;
using FinalProject_API.DTOs.Book;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using FinalProject_API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookRepository _bookRepo;
        private readonly IItemCategoryRepository _categoryRepo;
        private readonly ISubCategoryRepository _subCategoryRepo;
        private readonly IPublisherRepository _publisherRepo;
        private readonly IAuthorRepository _authorRepo;
        private readonly FileUploadService _fileUploadService;   // ← NEW
        private readonly AppDbContext _context;
        public BookController(
            IBookRepository bookRepo,
            IItemCategoryRepository categoryRepo,
            ISubCategoryRepository subCategoryRepo,
            IPublisherRepository publisherRepo,
            IAuthorRepository authorRepo,
            FileUploadService fileUploadService,
             AppDbContext context)                 // ← NEW
        {
            _bookRepo = bookRepo;
            _categoryRepo = categoryRepo;
            _subCategoryRepo = subCategoryRepo;
            _publisherRepo = publisherRepo;
            _authorRepo = authorRepo;
            _fileUploadService = fileUploadService;
            _context = context;

            // ← NEW
        }

        // GET: api/Book
        [HttpGet]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks()
        {
            var books = await _bookRepo.GetActiveBooksAsync();
            var bookIds = books.Select(b => b.BookId).ToList();

            // Get availability of physical copies
            var availableCopies = await _context.PhysicalCopies
                .Where(pc => pc.Status == "Available" && pc.IsActive)
                .GroupBy(pc => pc.BookEdition!.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .ToListAsync();

            var availabilityDict = availableCopies.ToDictionary(x => x.BookId, x => x.Count);

            // Get digital copy availability (already exists)
            var digitalAvailability = await _bookRepo.GetDigitalCopyAvailabilityAsync(bookIds);

            var response = books.Select(b =>
            {
                var dto = MapToResponse(b);
                dto.AvailableCopies = availabilityDict.GetValueOrDefault(b.BookId, 0);
                dto.HasDigitalCopy = digitalAvailability.GetValueOrDefault(b.BookId, false);
                return dto;
            });

            return Ok(response);
        }        // GET: api/Book/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookResponseDto>> GetBook(int id)
        {
            var book = await _bookRepo.GetBookWithDetailsAsync(id);
            if (book == null)
                return NotFound($"Book with ID {id} not found.");
            return Ok(MapToResponse(book));
        }

        // POST: api/Book  (now accepts multipart/form-data)
        [HttpPost]
        public async Task<ActionResult<BookResponseDto>> CreateBook([FromForm] BookRequestDto request)
        {
            // 🔴 Rule: At least one author is required
            if (request.AuthorIds == null || !request.AuthorIds.Any())
                return BadRequest("At least one author is required.");

            // Validate category exists if provided
            if (request.ItemCategoryId.HasValue)
            {
                var category = await _categoryRepo.GetByIdAsync(request.ItemCategoryId.Value);
                if (category == null)
                    return BadRequest($"Category with ID {request.ItemCategoryId} does not exist.");
            }

            // Validate subcategory exists if provided
            if (request.SubCategoryId.HasValue)
            {
                var subCategory = await _subCategoryRepo.GetByIdAsync(request.SubCategoryId.Value);
                if (subCategory == null)
                    return BadRequest($"SubCategory with ID {request.SubCategoryId} does not exist.");
            }

            // Validate publisher exists if provided
            if (request.PublisherId.HasValue)
            {
                var publisher = await _publisherRepo.GetByIdAsync(request.PublisherId.Value);
                if (publisher == null)
                    return BadRequest($"Publisher with ID {request.PublisherId} does not exist.");
            }

            // Validate authors exist
            var authors = new List<Author>();
            foreach (var authorId in request.AuthorIds)
            {
                var author = await _authorRepo.GetByIdAsync(authorId);
                if (author == null)
                    return BadRequest($"Author with ID {authorId} does not exist.");
                authors.Add(author);
            }

            // 🔴 Auto‑generate MasterISBN if not provided
            string masterISBN = string.IsNullOrWhiteSpace(request.MasterISBN)
                ? await _bookRepo.GenerateMasterISBNAsync()
                : request.MasterISBN;

            // 🔴 Handle cover image upload
            string? coverImageUrl = request.CoverImageUrl;
            if (request.CoverImageFile != null)
            {
                try
                {
                    coverImageUrl = await _fileUploadService.UploadPhotoAsync(request.CoverImageFile, "books");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            var book = new Book
            {
                Title = request.Title,
                Subtitle = request.Subtitle,
                Description = request.Description,
                ItemCategoryId = request.ItemCategoryId,
                SubCategoryId = request.SubCategoryId,
                BaseLibraryCode = request.BaseLibraryCode,
                MasterISBN = masterISBN,
                Language = request.Language,
                PublicationYear = request.PublicationYear,
                PageCount = request.PageCount,
                CoverImageUrl = coverImageUrl,   // ← uses the uploaded file URL
                IsRareBook = request.IsRareBook,
                RequiresSecurityDeposit = request.RequiresSecurityDeposit,
                SecurityDepositAmount = request.SecurityDepositAmount,
                PublisherId = request.PublisherId,
                DDCNumber = request.DDCNumber,
                CutterNumber = request.CutterNumber
            };

            // Add BookAuthors junction records
            foreach (var author in authors)
            {
                book.BookAuthors.Add(new BookAuthor { AuthorId = author.AuthorId, Book = book });
            }

            await _bookRepo.AddAsync(book);
            await _bookRepo.SaveChangesAsync();

            var createdBook = await _bookRepo.GetBookWithDetailsAsync(book.BookId);
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, MapToResponse(createdBook!));
        }

        // PUT: api/Book/5  (now accepts multipart/form-data)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] BookRequestDto request)
        {
            var existingBook = await _bookRepo.GetBookWithDetailsAsync(id);
            if (existingBook == null)
                return NotFound($"Book with ID {id} not found.");

            // 🔴 At least one author required on update as well
            if (request.AuthorIds == null || !request.AuthorIds.Any())
                return BadRequest("At least one author is required.");

            // Validate category
            if (request.ItemCategoryId.HasValue)
            {
                var category = await _categoryRepo.GetByIdAsync(request.ItemCategoryId.Value);
                if (category == null)
                    return BadRequest($"Category with ID {request.ItemCategoryId} does not exist.");
            }

            // Validate subcategory
            if (request.SubCategoryId.HasValue)
            {
                var subCategory = await _subCategoryRepo.GetByIdAsync(request.SubCategoryId.Value);
                if (subCategory == null)
                    return BadRequest($"SubCategory with ID {request.SubCategoryId} does not exist.");
            }

            // Validate publisher
            if (request.PublisherId.HasValue)
            {
                var publisher = await _publisherRepo.GetByIdAsync(request.PublisherId.Value);
                if (publisher == null)
                    return BadRequest($"Publisher with ID {request.PublisherId} does not exist.");
            }

            // Validate authors
            var newAuthors = new List<Author>();
            foreach (var authorId in request.AuthorIds)
            {
                var author = await _authorRepo.GetByIdAsync(authorId);
                if (author == null)
                    return BadRequest($"Author with ID {authorId} does not exist.");
                newAuthors.Add(author);
            }

            // 🔴 Handle cover image upload
            if (request.CoverImageFile != null)
            {
                try
                {
                    existingBook.CoverImageUrl = await _fileUploadService.UploadPhotoAsync(request.CoverImageFile, "books");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
            {
                existingBook.CoverImageUrl = request.CoverImageUrl;
            }
            // else keep the old CoverImageUrl

            // Update scalar properties
            existingBook.Title = request.Title;
            existingBook.Subtitle = request.Subtitle;
            existingBook.Description = request.Description;
            existingBook.ItemCategoryId = request.ItemCategoryId;
            existingBook.SubCategoryId = request.SubCategoryId;
            existingBook.MasterISBN = request.MasterISBN ?? existingBook.MasterISBN;
            existingBook.Language = request.Language;
            existingBook.PublicationYear = request.PublicationYear;
            existingBook.PageCount = request.PageCount;
            // CoverImageUrl already set above
            existingBook.IsRareBook = request.IsRareBook;
            existingBook.RequiresSecurityDeposit = request.RequiresSecurityDeposit;
            existingBook.SecurityDepositAmount = request.SecurityDepositAmount;
            existingBook.PublisherId = request.PublisherId;
            existingBook.DDCNumber = request.DDCNumber;
            existingBook.CutterNumber = request.CutterNumber;
            existingBook.UpdatedDate = DateTime.Now;

            // Update BookAuthors: remove old, add new
            existingBook.BookAuthors.Clear();
            foreach (var author in newAuthors)
            {
                existingBook.BookAuthors.Add(new BookAuthor { AuthorId = author.AuthorId, BookId = existingBook.BookId });
            }

            _bookRepo.Update(existingBook);
            await _bookRepo.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Book/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _bookRepo.GetByIdAsync(id);
            if (book == null)
                return NotFound($"Book with ID {id} not found.");

            _bookRepo.SoftDelete(book);
            await _bookRepo.SaveChangesAsync();

            return NoContent();
        }

        // Helper mapping
        private BookResponseDto MapToResponse(Book book)
        {
            return new BookResponseDto
            {
                BookId = book.BookId,
                Title = book.Title,
                Subtitle = book.Subtitle,
                Description = book.Description,
                ItemCategoryId = book.ItemCategoryId,
                CategoryName = book.ItemCategory?.CategoryName,
                SubCategoryId = book.SubCategoryId,
                SubCategoryName = book.SubCategory?.Name,
                MasterISBN = book.MasterISBN,
                Language = book.Language,
                PublicationYear = book.PublicationYear,
                PageCount = book.PageCount,
                CoverImageUrl = book.CoverImageUrl,
                IsRareBook = book.IsRareBook,
                RequiresSecurityDeposit = book.RequiresSecurityDeposit,
                SecurityDepositAmount = book.SecurityDepositAmount,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name,
                DDCNumber = book.DDCNumber,
                CutterNumber = book.CutterNumber,
                CallNumber = book.CallNumber,
                IsActive = book.IsActive,
                CreatedDate = book.CreatedDate,
                UpdatedDate = book.UpdatedDate,
                Authors = book.BookAuthors.Select(ba => new AuthorBriefDto
                {
                    AuthorId = ba.AuthorId,
                    FullName = ba.Author?.FullName ?? ""
                }).ToList()
            };
        }
    }
}
