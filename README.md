# Survey Application

A full-stack survey application built with a **C# ASP.NET Core API** and a **vanilla HTML/CSS/JS frontend**, using **MongoDB Atlas** as the database.

---

## Project Structure

```
SurveyApplication/
├── SurveyApi/                          ← C# ASP.NET Core Web API
│   ├── Controllers/
│   │   └── SurveyController.cs         ← HTTP routing (questions, submit, results)
│   ├── Entities/
│   │   └── SurveySubmissionDocument.cs ← MongoDB document model
│   ├── Models/
│   │   ├── Requests/
│   │   │   └── SubmitSurveyRequest.cs  ← Incoming POST body shape
│   │   ├── Responses/
│   │   │   └── SurveyResponses.cs      ← Outgoing question and submission shapes
│   │   └── Settings/
│   │       └── MongoDbSettings.cs      ← Config binding model
│   ├── Services/
│   │   ├── ISurveyService.cs           ← Service interface
│   │   └── SurveyService.cs            ← Business logic + MongoDB access
│   ├── appsettings.json                ← MongoDB connection string in here
│   ├── Program.cs                      ← App setup + dependency injection
│   └── SurveyApi.csproj                ← NuGet packages (MongoDB.Driver)
│
└── SurveyFrontend/                     ← Static HTML/CSS/JS frontend
    ├── css/
    │   └── Styles.css                  ← Shared styles for all pages
    ├── js/
    │   ├── Script.js                   ← Survey form logic (Survey.html)
    │   └── Results.js                  ← Results table logic (results.html)
    ├── Survey.html                      ← Survey form page
    └── Results.html                    ← Submissions results page
```

---

## Prerequisites

Make sure the following are installed before running anything:

| Tool | Version | Download |
|---|---|---|
| .NET SDK | 8.0 or later | https://dotnet.microsoft.com/download |
| A browser | Any modern browser | — |
| MongoDB Atlas account | Free tier | https://cloud.mongodb.com |
| VS Code (recommended) | Latest | https://code.visualstudio.com |
| VS (recommended) | Latest |https://visualstudio.microsoft.com |
| Live Server extension | Latest | VS Code Extensions marketplace |

---

## What to Run First

### 1. Set up MongoDB Atlas

You must do this before running the API — the app needs a live database connection to start correctly.

**However for this demo, I have already kept url public and the user only has readonly access so no need to follow the rest of the steps.** 

1. Sign up or log in at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0 cluster** (choose a region — Frankfurt is closest for SA)
3. Create a **database user** under Security → Database Access
4. Whitelist your IP under Security → Network Access
5. Get your connection string from **Database → Connect → Drivers**
6. Replace `<password>` in the string with your actual password

---

### 2. Configure the API

Open `SurveyApi/appsettings.json` and paste your connection string:

```json
"MongoDbSettings": {
  "ConnectionString": "mongodb+srv://youruser:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority",
  "DatabaseName": "SurveyDb",
  "CollectionName": "submissions"
}
```

> ⚠️ Do not commit this file to GitHub with a real password. Add `appsettings.json` to your `.gitignore`.

---

### 3. Install NuGet packages and run the API

Open a terminal inside the `SurveyApi/SurveyApi` folder and run:

```bash
# Start the API
dotnet run --launch-profile https
```
Or into the folder and click on the solution `SurveyApi.sln`

Then in VS, choose https and run the application, it will open a console and browser should be swagger.

<img width="1919" height="818" alt="image" src="https://github.com/user-attachments/assets/009f8ca8-cdfc-4251-a580-015bccb07eeb" />


You should see:

```
info: Now listening on: https://localhost:7091
```

Or:

<img width="1780" height="1034" alt="image" src="https://github.com/user-attachments/assets/dd31afec-f094-40c4-b4c2-32bd3c816624" />

<img width="1095" height="596" alt="image" src="https://github.com/user-attachments/assets/bb27c3c6-5444-41ef-a2b8-f9927dad7ea3" />

Keep this terminal open — the API must be running before you open the frontend.

---

### 4. Open the frontend

Open `SurveyFrontend/Survey.html` in your browser. A recommended way is using **VS Code Live Server**:

1. Right-click `index.html` in VS Code
2. Click **"Open with Live Server"**
3. The page will open at `http://127.0.0.1:5500/SurveyFrontend/Survey.html`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/survey/questions` | Returns 10 questions in random order |
| `POST` | `/api/survey/submit` | Validates and saves a submission to Atlas |
| `GET` | `/api/survey/submissions` | Returns all stored submissions, newest first |

---

## Frontend Pages

| Page | URL | Description |
|---|---|---|
| Survey Form | `Survey.html` | Fill in and submit the employee survey |
| Results | `Results.html` | View all stored submissions in a table |

---

## Survey Questions

The survey contains **10 questions** hardcoded in `SurveyService.cs`, displayed in a **random order** on each page load:

| # | Type | Question |
|---|---|---|
| 1 | Number | How many years of work experience do you have? |
| 2 | Number | How many hours per week do you typically work? |
| 3 | Number | On a scale of 1–10, how satisfied are you with your job? |
| 4 | Text | What is your current job title? |
| 5 | Text | Which city do you currently work in? |
| 6 | Text | What skills would you like to improve? |
| 7 | Text | Describe your ideal working environment. |
| 8 | Text | What is your highest qualification? |
| 9 | Date | What is your date of birth? |
| 10 | Date | When did you start your current role? |

In addition, **Email Address** and **ID Number** are always required fixed fields at the top of the form.

---

## Validation Rules

| Field | Rule |
|---|---|
| Email Address | Required, must match standard email format |
| ID Number | Required, must be a valid 13-digit South African ID |
| All survey questions | Required, cannot be empty |

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | C# ASP.NET Core 8 (Minimal hosting model) |
| Database | MongoDB Atlas (cloud-hosted) |
| MongoDB Driver | MongoDB.Driver 2.28.0 |
| Frontend | HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| Architecture | Layered — Controllers → Services → MongoDB |

---

## Common Issues

| Problem | Fix |
|---|---|
| Questions not loading | Make sure the API is running on `https://localhost:7091` |
| `Authentication failed` error | Check the username/password in your connection string |
| `Connection timed out` | Your IP is not whitelisted in Atlas Network Access |
| Submissions not saving | Confirm `DatabaseName` and `CollectionName` in `appsettings.json` are correct |
| CORS error in browser | Ensure `dotnet run --launch-profile https` is running and CORS is enabled in `Program.cs` |
