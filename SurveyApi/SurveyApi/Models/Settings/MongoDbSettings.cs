namespace SurveyApi.Models.Settings
{
    /// <summary>
    /// Variables for MongoDB connection settings, such as connection string, database name, and collection names.
    /// </summary>
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
    }
}
