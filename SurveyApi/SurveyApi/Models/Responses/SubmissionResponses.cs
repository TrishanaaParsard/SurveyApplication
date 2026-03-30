namespace SurveyApi.Models.Responses
{
    public class SubmissionResponses
    {
        /// <summary>
        /// A single survey question returned by GET /api/Survey/questions.
        /// </summary>
        public class QuestionResponse
        {
            public int Id { get; set; }
            public string Text { get; set; } = string.Empty;
            public string InputType { get; set; } = string.Empty;
            public bool IsRequired { get; set; } = true;
        }

        /// <summary>
        /// The envelope returned after a successful POST /api/ Survey/submit.
        /// </summary>
        public class SubmitSurveyResponse
        {
            public string Message { get; set; } = string.Empty;
            public List<SubmissionField> Data { get; set; } = new();
        }

        /// <summary>
        /// One field/value pair inside the submit response — the "clean list" the spec requires.
        /// </summary>
        public class SubmissionField
        {
            public string Field { get; set; } = string.Empty;
            public string Value { get; set; } = string.Empty;
        }

        /// <summary>
        /// A stored submission returned by GET /api/Survey/submissions.
        /// </summary>
        public class SubmissionResponse
        {
            public string Id { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string IdNumber { get; set; } = string.Empty;
            public string SubmittedAt { get; set; } = string.Empty;
            public List<SubmissionAnswerResponse> Answers { get; set; } = new();
        }

        /// <summary>
        /// Question and Answer inside a stored submission response.
        /// </summary>
        public class SubmissionAnswerResponse
        {
            public string Question { get; set; } = string.Empty;
            public string Answer { get; set; } = string.Empty;
        }
    }
}
