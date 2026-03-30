using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SurveyApi.Entities
{
    /// <summary>
    /// Represents a survey submission document containing the data submitted by a user.
    /// </summary>
    public class SurveySubmissionDocument
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("idNumber")]
        public string IdNumber { get; set; } = string.Empty;

        [BsonElement("answers")]
        public List<AnswerEntry> Answers { get; set; } = new();

        [BsonElement("submittedAt")]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }

    // A single question/answer pair embedded inside the submission document.
    public class AnswerEntry
    {
        [BsonElement("questionId")]
        public int QuestionId { get; set; }

        [BsonElement("questionText")]
        public string QuestionText { get; set; } = string.Empty;

        [BsonElement("answer")]
        public string Answer { get; set; } = string.Empty;
    }
}