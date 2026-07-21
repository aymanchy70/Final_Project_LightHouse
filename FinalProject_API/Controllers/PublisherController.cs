using FinalProject_API.DTOs.Publisher;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublisherController : ControllerBase
    {
        private readonly IPublisherRepository _publisherRepo;

        public PublisherController(IPublisherRepository publisherRepo)
        {
            _publisherRepo = publisherRepo;
        }

        // GET: api/Publisher
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PublisherResponseDto>>> GetPublishers()
        {
            var publishers = await _publisherRepo.GetAllAsync();
            var response = publishers.Select(MapToResponse);
            return Ok(response);
        }

        // GET: api/Publisher/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<PublisherResponseDto>>> GetActivePublishers()
        {
            var publishers = await _publisherRepo.GetActivePublishersAsync();
            var response = publishers.Select(MapToResponse);
            return Ok(response);
        }

        // GET: api/Publisher/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PublisherResponseDto>> GetPublisher(int id)
        {
            var publisher = await _publisherRepo.GetByIdAsync(id);
            if (publisher == null)
                return NotFound($"Publisher with ID {id} not found.");
            return Ok(MapToResponse(publisher));
        }

        // POST: api/Publisher
        [HttpPost]
        public async Task<ActionResult<PublisherResponseDto>> CreatePublisher(PublisherRequestDto request)
        {
            if (await _publisherRepo.IsDuplicateAsync(request.Name))
                return Conflict($"Publisher '{request.Name}' already exists.");

            var publisher = new Publisher
            {
                Name = request.Name,
                Address = request.Address,
                Phone = request.Phone,
                Email = request.Email,
                Website = request.Website
            };

            await _publisherRepo.AddAsync(publisher);
            await _publisherRepo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPublisher), new { id = publisher.PublisherId }, MapToResponse(publisher));
        }

        // PUT: api/Publisher/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePublisher(int id, PublisherRequestDto request)
        {
            var publisher = await _publisherRepo.GetByIdAsync(id);
            if (publisher == null)
                return NotFound($"Publisher with ID {id} not found.");

            if (await _publisherRepo.IsDuplicateAsync(request.Name, id))
                return Conflict($"Publisher '{request.Name}' already exists.");

            publisher.Name = request.Name;
            publisher.Address = request.Address;
            publisher.Phone = request.Phone;
            publisher.Email = request.Email;
            publisher.Website = request.Website;
            publisher.UpdatedDate = DateTime.Now;

            _publisherRepo.Update(publisher);
            await _publisherRepo.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Publisher/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePublisher(int id)
        {
            var publisher = await _publisherRepo.GetByIdAsync(id);
            if (publisher == null)
                return NotFound($"Publisher with ID {id} not found.");

            _publisherRepo.SoftDelete(publisher);
            await _publisherRepo.SaveChangesAsync();

            return NoContent();
        }

        private PublisherResponseDto MapToResponse(Publisher publisher)
        {
            return new PublisherResponseDto
            {
                PublisherId = publisher.PublisherId,
                Name = publisher.Name,
                Address = publisher.Address,
                Phone = publisher.Phone,
                Email = publisher.Email,
                Website = publisher.Website,
                IsActive = publisher.IsActive,
                CreatedDate = publisher.CreatedDate,
                UpdatedDate = publisher.UpdatedDate
            };
        }
    }
}
