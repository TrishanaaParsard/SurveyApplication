using Microsoft.AspNetCore.Mvc;
using SurveyApi.Models.Requests;
using SurveyApi.Services;

namespace SurveyApi.Controllers
{
    /// <summary>
    /// Handles all HTTP routing for the survey API.
    /// This controller only deals with HTTP concerns (routing, status codes, request/response shapes).
    /// All business logic is in ISurveyService.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SurveyController : ControllerBase
    {
        private readonly ISurveyService _surveyService;

        public SurveyController(ISurveyService surveyService)
        {
            _surveyService = surveyService;
        }

        // GET api/Survey/questions
        // Returns 10 questions in a random order
        [HttpGet("questions")]
        public IActionResult GetQuestions()
        {
            var questions = _surveyService.GetShuffledQuestions();
            return Ok(questions);
        }

        // POST api/Survey/submit
        // Validates, saves to MongoDB Atlas, returns clean list in console log.
        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitSurveyRequest? request)
        {
            if (request is null)
                return BadRequest(new { error = "Request body is required." });

            var (response, errors) = await _surveyService.SubmitAsync(request);

            if (errors.Any())
                return BadRequest(new { errors });

            return Ok(response);
        }

        
        // GET api/Survey/submissions
        // Returns all stored submissions, newest first
        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissions()
        {
            var submissions = await _surveyService.GetAllSubmissionsAsync();
            return Ok(submissions);
        }
    }
}