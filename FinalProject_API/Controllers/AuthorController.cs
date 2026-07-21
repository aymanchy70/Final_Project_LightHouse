using FinalProject_API.DTOs.Author;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using FinalProject_API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly IAuthorRepository _authorRepo;
        private readonly FileUploadService _fileUploadService;

        public AuthorController(IAuthorRepository authorRepo, FileUploadService fileUploadService)
        {
            _authorRepo = authorRepo;
            _fileUploadService = fileUploadService;
        }
        // GET: api/Author
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuthorResponseDto>>> GetAuthors()
        {
            var authors = await _authorRepo.GetAllAsync();

            var response = authors.Select(a => new AuthorResponseDto
            {
                AuthorId = a.AuthorId,
                FullName = a.FullName,
                Pseudonym = a.Pseudonym,
                DateOfBirth = a.DateOfBirth,
                DateOfDeath = a.DateOfDeath,
                Nationality = a.Nationality,
                Biography = a.Biography,
                PhotoUrl = a.PhotoUrl,
                Email = a.Email,
                IsActive = a.IsActive,
                CreatedDate = a.CreatedDate,
                UpdatedDate = a.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/Author/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<AuthorResponseDto>>> GetActiveAuthors()
        {
            var authors = await _authorRepo.GetActiveAuthorsAsync();

            var response = authors.Select(a => new AuthorResponseDto
            {
                AuthorId = a.AuthorId,
                FullName = a.FullName,
                Pseudonym = a.Pseudonym,
                DateOfBirth = a.DateOfBirth,
                DateOfDeath = a.DateOfDeath,
                Nationality = a.Nationality,
                Biography = a.Biography,
                PhotoUrl = a.PhotoUrl,
                Email = a.Email,
                IsActive = a.IsActive,
                CreatedDate = a.CreatedDate,
                UpdatedDate = a.UpdatedDate
            });

            return Ok(response);
        }

        // GET: api/Author/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AuthorResponseDto>> GetAuthor(int id)
        {
            var author = await _authorRepo.GetByIdAsync(id);

            if (author == null)
                return NotFound($"Author with ID {id} not found.");

            var response = new AuthorResponseDto
            {
                AuthorId = author.AuthorId,
                FullName = author.FullName,
                Pseudonym = author.Pseudonym,
                DateOfBirth = author.DateOfBirth,
                DateOfDeath = author.DateOfDeath,
                Nationality = author.Nationality,
                Biography = author.Biography,
                PhotoUrl = author.PhotoUrl,
                Email = author.Email,
                IsActive = author.IsActive,
                CreatedDate = author.CreatedDate,
                UpdatedDate = author.UpdatedDate
            };

            return Ok(response);
        }

        // POST: api/Author
        [HttpPost]
        public async Task<ActionResult<AuthorResponseDto>> CreateAuthor([FromForm] AuthorRequestDto request)
        {
            // Check for duplicate full name
            if (await _authorRepo.IsDuplicateAsync(request.FullName))
                return Conflict($"An author with the name '{request.FullName}' already exists.");

            // Handle photo upload
            string? photoUrl = null;
            if (request.PhotoFile != null)
            {
                try
                {
                    photoUrl = await _fileUploadService.UploadPhotoAsync(request.PhotoFile, "authors");
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            var author = new Author
            {
                FullName = request.FullName,
                Pseudonym = request.Pseudonym,
                DateOfBirth = request.DateOfBirth,
                DateOfDeath = request.DateOfDeath,
                Nationality = request.Nationality,
                Biography = request.Biography,
                PhotoUrl = photoUrl,  // Set the saved file URL
                Email = request.Email
            };

            await _authorRepo.AddAsync(author);
            await _authorRepo.SaveChangesAsync();

            var response = MapToResponse(author);
            return CreatedAtAction(nameof(GetAuthor), new { id = author.AuthorId }, response);
        }


        // PUT: api/Author/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAuthor(int id, [FromForm] AuthorRequestDto request)
        {
            var existingAuthor = await _authorRepo.GetByIdAsync(id);
            if (existingAuthor == null)
                return NotFound($"Author with ID {id} not found.");

            // Check for duplicate name (excluding current author)
            if (await _authorRepo.IsDuplicateAsync(request.FullName, id))
                return Conflict($"An author with the name '{request.FullName}' already exists.");

            // Handle photo upload (replace old photo if new one provided)
            if (request.PhotoFile != null)
            {
                try
                {
                    var newPhotoUrl = await _fileUploadService.UploadPhotoAsync(request.PhotoFile, "authors");

                    // Optionally delete old photo file (not implemented for brevity)

                    existingAuthor.PhotoUrl = newPhotoUrl;
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            existingAuthor.FullName = request.FullName;
            existingAuthor.Pseudonym = request.Pseudonym;
            existingAuthor.DateOfBirth = request.DateOfBirth;
            existingAuthor.DateOfDeath = request.DateOfDeath;
            existingAuthor.Nationality = request.Nationality;
            existingAuthor.Biography = request.Biography;
            existingAuthor.Email = request.Email;
            existingAuthor.UpdatedDate = DateTime.Now;

            _authorRepo.Update(existingAuthor);
            await _authorRepo.SaveChangesAsync();

            return NoContent();
        }
        // DELETE: api/Author/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var author = await _authorRepo.GetByIdAsync(id);
            if (author == null)
                return NotFound($"Author with ID {id} not found.");

            _authorRepo.SoftDelete(author);
            await _authorRepo.SaveChangesAsync();

            return NoContent();
        }

        private AuthorResponseDto MapToResponse(Author author)
        {
            return new AuthorResponseDto
            {
                AuthorId = author.AuthorId,
                FullName = author.FullName,
                Pseudonym = author.Pseudonym,
                DateOfBirth = author.DateOfBirth,
                DateOfDeath = author.DateOfDeath,
                Nationality = author.Nationality,
                Biography = author.Biography,
                PhotoUrl = author.PhotoUrl,
                Email = author.Email,
                IsActive = author.IsActive,
                CreatedDate = author.CreatedDate,
                UpdatedDate = author.UpdatedDate
            };
        }
    }
}
