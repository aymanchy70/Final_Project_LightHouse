using FinalProject_API.DTOs.FineRule;
using FinalProject_API.Entities;
using FinalProject_API.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FineRuleController : ControllerBase
    {
        private readonly IFineRuleRepository _repo;

        public FineRuleController(IFineRuleRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FineRuleResponseDto>>> GetAll()
        {
            var rules = await _repo.GetActiveRulesAsync();
            return Ok(rules.Select(MapToResponse));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FineRuleResponseDto>> GetById(int id)
        {
            var rule = await _repo.GetByIdAsync(id);
            if (rule == null) return NotFound();
            return Ok(MapToResponse(rule));
        }

        [HttpPost]
        public async Task<ActionResult<FineRuleResponseDto>> Create(FineRuleRequestDto dto)
        {
            var entity = new FineRule
            {
                RuleName = dto.RuleName,
                FineType = dto.FineType,
                FineAmount = dto.FineAmount,
                FinePerDay = dto.FinePerDay,
                PercentageOfBookPrice = dto.PercentageOfBookPrice,
                MaxFineAmount = dto.MaxFineAmount,
                GracePeriodDays = dto.GracePeriodDays
            };
            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.FineRuleId }, MapToResponse(entity));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FineRuleRequestDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return NotFound();

            entity.RuleName = dto.RuleName;
            entity.FineType = dto.FineType;
            entity.FineAmount = dto.FineAmount;
            entity.FinePerDay = dto.FinePerDay;
            entity.PercentageOfBookPrice = dto.PercentageOfBookPrice;
            entity.MaxFineAmount = dto.MaxFineAmount;
            entity.GracePeriodDays = dto.GracePeriodDays;
            entity.UpdatedDate = DateTime.Now;

            _repo.Update(entity);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return NotFound();
            _repo.SoftDelete(entity);
            await _repo.SaveChangesAsync();
            return NoContent();
        }

        private FineRuleResponseDto MapToResponse(FineRule rule)
        {
            return new FineRuleResponseDto
            {
                FineRuleId = rule.FineRuleId,
                RuleName = rule.RuleName,
                FineType = rule.FineType,
                FineAmount = rule.FineAmount,
                FinePerDay = rule.FinePerDay,
                PercentageOfBookPrice = rule.PercentageOfBookPrice,
                MaxFineAmount = rule.MaxFineAmount,
                GracePeriodDays = rule.GracePeriodDays,
                IsActive = rule.IsActive,
                CreatedDate = rule.CreatedDate,
                UpdatedDate = rule.UpdatedDate
            };
        }
    }
}
