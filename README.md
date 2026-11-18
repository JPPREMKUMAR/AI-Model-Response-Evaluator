# AI Model Response Evaluator

A web application for evaluating AI-generated responses using manual evaluation and AI-powered scoring. Compare response quality across criteria such as relevance, accuracy, completeness, and clarity, and review evaluation history and analytics.

## Live Demo

- **Frontend:** https://ai-model-response-evalutor.vercel.app/
- **Backend API:** https://ai-model-evalutor-server-9jsopqkqz.vercel.app/
- **GitHub Repository:** https://github.com/JPPREMKUMAR/AI-Model-Response-Evaluator.git

## Features

- User registration and authentication
- Manual response evaluation
- AI-powered response evaluation
- Support for Gemini and OpenAI providers
- Evaluation criteria including relevance, accuracy, completeness, and clarity
- Evaluation history
- Analytics dashboard and charts
- Provider selection for AI evaluation
- Responsive web interface

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

### AI Providers
- Google Gemini
- OpenAI

### Deployment
- Vercel (frontend and backend)
- MongoDB Atlas (database)

## Architecture

```text
React + Vite Frontend
        |
        | HTTP / API requests
        v
Express.js Backend (Vercel)
        |
        +------ MongoDB Atlas
        |
        +------ Google Gemini API
        |
        +------ OpenAI API
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database (local or MongoDB Atlas)
- Gemini API key and/or OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/JPPREMKUMAR/AI-Model-Response-Evaluator.git
cd AI-Model-Response-Evaluator
```

### 2. Install dependencies

Install dependencies in the frontend and backend folders:

```bash
cd client
npm install
```

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create environment files for the client and server based on the variable names used in the source code. Do not commit real credentials.

Example frontend environment file (`client/.env`):

```env
VITE_API_URL=http://localhost:5000
```

Example backend environment file (`server/.env`):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

> **Important:** Environment variable names may differ depending on the implementation. Check the project's configuration files and use the exact names expected by the code. Never commit `.env` files or API keys.

### 4. Run the backend

From the `server` directory:

```bash
npm run dev
```

If the project does not define a development script, use its configured start script:

```bash
npm start
```

### 5. Run the frontend

From the `client` directory:

```bash
npm run dev
```

Vite will print the local frontend URL in the terminal.

## Evaluation Workflow

1. Sign up or log in.
2. Enter the prompt and the AI-generated response to evaluate.
3. Choose manual evaluation or an AI evaluation mode.
4. Select an AI provider when applicable.
5. Review evaluation scores and feedback.
6. Save and review evaluations in history.
7. Use analytics to explore evaluation results.

## Testing

Use a variety of responses to test the evaluator:

- Correct and complete responses
- Incorrect factual responses
- Incomplete responses
- Irrelevant responses
- Clear and well-structured responses
- Poorly written responses
- Coding responses
- Reasoning responses
- Responses that fail to follow instructions
- Unsupported claims or hallucinations

Compare results across providers to assess consistency.

## Deployment

### Frontend (Vercel)

1. Import the GitHub repository into Vercel.
2. Set the Root Directory to `client`.
3. Select Vite as the framework.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure the frontend API URL environment variable.
7. Deploy.

### Backend (Vercel)

1. Configure the backend deployment for the `server` directory.
2. Add the required database, authentication, and AI-provider environment variables.
3. Deploy and verify the API health endpoint.

### Database

Configure MongoDB Atlas and add the connection string to the backend environment variables. Ensure the database access and network settings permit the deployed backend to connect.

## Security Notes

- Keep API keys and database credentials in environment variables.
- Never commit `.env` files.
- Use a strong JWT secret.
- Restrict database network access appropriately.
- Validate and sanitize user input on the backend.
- Do not expose provider API keys in frontend code.

## Future Improvements

- Side-by-side model response comparison
- More evaluation criteria and customizable weights
- Export evaluation reports
- Additional AI providers
- Prompt and response versioning
- Improved benchmarking and consistency analysis

## Author

**Prem Kumar JP**

- Portfolio: https://jppremkumar.vercel.app/
- GitHub: https://github.com/JPPREMKUMAR
- LinkedIn: https://www.linkedin.com/in/jppremkumar/

---

*This project is built to explore AI response quality evaluation, model comparison, and practical AI integration in a full-stack web application.*
