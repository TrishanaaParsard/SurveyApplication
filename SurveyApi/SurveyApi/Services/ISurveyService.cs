using SurveyApi.Models.Requests;
using SurveyApi.Models.Responses;
using static SurveyApi.Models.Responses.SubmissionResponses;

namespace SurveyApi.Services
{
    /// <summary>
    /// Business-logic contract for the survey domain.
    /// Controllers depend on this interface.
    /// </summary>
    public interface ISurveyService
    {
        /// <summary>Return all questions in a freshly shuffled order.</summary>
        List<QuestionResponse> GetShuffledQuestions();

        /// <summary>
        /// Persist a survey submission.
        /// Returns response
        /// </summary>
        Task<(SubmitSurveyResponse? Response, List<string> Errors)>
            SubmitAsync(SubmitSurveyRequest request);

        /// <summary>Return all stored submissions, newest first.</summary>
        Task<List<SubmissionResponse>> GetAllSubmissionsAsync();
    }
}