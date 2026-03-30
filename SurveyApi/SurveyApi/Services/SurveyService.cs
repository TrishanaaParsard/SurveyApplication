using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SurveyApi.Entities;
using SurveyApi.Models.Requests;
using SurveyApi.Models.Settings;
using static SurveyApi.Models.Responses.SubmissionResponses;

namespace SurveyApi.Services
{
    /// <summary>
    /// Handles all survey business logic AND MongoDB Atlas access directly.
    /// </summary>
    public class SurveyService : ISurveyService
    {
        private readonly IMongoCollection<SurveySubmissionDocument> _collection;

        // Hardcoded questions: 3 number, 5 text, 2 date
        private static readonly List<QuestionResponse> _questions = new()
        {
            new() { Id = 1,  Text = "How many years of work experience do you have?",           InputType = "number", IsRequired = true },
            new() { Id = 2,  Text = "How many hours per week do you typically work?",            InputType = "number", IsRequired = true },
            new() { Id = 3,  Text = "On a scale of 1–10, how satisfied are you with your job?", InputType = "number", IsRequired = true },
            new() { Id = 4,  Text = "What is your current job title?",                           InputType = "text",   IsRequired = true },
            new() { Id = 5,  Text = "Which city do you currently work in?",                      InputType = "text",   IsRequired = true },
            new() { Id = 6,  Text = "What skills would you like to improve?",                    InputType = "text",   IsRequired = true },
            new() { Id = 7,  Text = "Describe your ideal working environment.",                   InputType = "text",   IsRequired = true },
            new() { Id = 8,  Text = "What is your highest qualification?",                       InputType = "text",   IsRequired = true },
            new() { Id = 9,  Text = "What is your date of birth?",                               InputType = "date",   IsRequired = true },
            new() { Id = 10, Text = "When did you start your current role?",                     InputType = "date",   IsRequired = true },
        };

        public SurveyService(IOptions<MongoDbSettings> settings)
        {
            var cfg = settings.Value;
            var client = new MongoClient(cfg.ConnectionString);
            var db = client.GetDatabase(cfg.DatabaseName);
            _collection = db.GetCollection<SurveySubmissionDocument>(cfg.CollectionName);
        }

        //  Get shuffled questions
        public List<QuestionResponse> GetShuffledQuestions()
            => _questions.OrderBy(_ => Guid.NewGuid()).ToList();

        // Submit
        public async Task<(SubmitSurveyResponse? Response, List<string> Errors)>
            SubmitAsync(SubmitSurveyRequest request)
        {
    
            // Map request, entity
            var document = new SurveySubmissionDocument
            {
                Email = request.Email.Trim(),
                IdNumber = request.IdNumber.Trim(),
                SubmittedAt = DateTime.UtcNow,
                Answers = request.Answers.Select(a => new AnswerEntry
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.QuestionText,
                    Answer = a.Answer.Trim()
                }).ToList()
            };

            await _collection.InsertOneAsync(document);

            // Build clean list response
            var fields = new List<SubmissionField>
            {
                new() { Field = "Submission ID", Value = document.Id! },
                new() { Field = "Email Address", Value = document.Email },
                new() { Field = "ID Number",     Value = document.IdNumber }
            };

            fields.AddRange(document.Answers.Select(a => new SubmissionField
            {
                Field = a.QuestionText,
                Value = a.Answer
            }));

            return (new SubmitSurveyResponse
            {
                Message = "Submission saved successfully.",
                Data = fields
            }, new List<string>());
        }

        // Get all submissions
        public async Task<List<SubmissionResponse>> GetAllSubmissionsAsync()
        {
            var docs = await _collection
                .Find(_ => true)
                .SortByDescending(d => d.SubmittedAt)
                .ToListAsync();

            return docs.Select(MapToResponse).ToList();
        }

        // Private: entity, response mapping
        private static SubmissionResponse MapToResponse(SurveySubmissionDocument doc) => new()
        {
            Id = doc.Id ?? string.Empty,
            Email = doc.Email,
            IdNumber = doc.IdNumber,
            SubmittedAt = doc.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss") + " UTC",
            Answers = doc.Answers.Select(a => new SubmissionAnswerResponse
            {
                Question = a.QuestionText,
                Answer = a.Answer
            }).ToList()
        };
    }
}