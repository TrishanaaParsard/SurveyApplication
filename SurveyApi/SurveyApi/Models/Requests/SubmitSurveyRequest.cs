namespace SurveyApi.Models.Requests
{
    /// <summary>
    /// The body the frontend sends when submitting the survey.
    /// </summary>
    public class SubmitSurveyRequest
    {
        public string Email { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public List<SurveyAnswerRequest> Answers { get; set; } = new();
    }

    /// <summary>
    /// Questiom and Answer inside the submission request.
    /// </summary>
    public class SurveyAnswerRequest
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
    }
}