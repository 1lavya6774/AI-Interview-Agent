# AI Interview Agent

A personalized AI interview practice platform — paste your resume, pick a role, choose an interview type and difficulty, and get scored by an AI interviewer powered by OpenRouter.

## Features

- **Personalized questions** — Questions are generated from your actual resume and target role
- **Configurable interview style** — Choose Technical, Behavioral, or Mixed interview types
- **Difficulty levels** — Entry, Mid, or Senior difficulty
- **Flexible question count** — 5–15 questions (default 10)
- **Resume upload** — Drag-and-drop PDF, DOCX, or TXT files (or paste text)
- **Real-time scoring** — Get a 0–100 score with a verdict (Strong Hire / Hire / Borderline / No Hire)
- **Per-question feedback** — Detailed breakdown of each answer with scoring rationale
- **Graded in real-time** — Animated grading stage shows progress while the AI evaluates
- **Single-server deployment** — Runs entirely on Next.js, deployable to Vercel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3 (App Router) |
| Runtime | Node.js |
| AI Provider | OpenRouter (Anthropic/DeepSeek/other models) |
| Styling | Tailwind CSS + custom animations |
| Icons | Lucide React |
| File Parsing | pdf-parse (PDF), mammoth (DOCX) |
| Deployments | Vercel-compatible (single server) |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/1lavya6774/AI-Interview-Agent.git
cd AI-Interview-Agent

# Install dependencies
npm install

# Add your OpenRouter API key
cp .env.example .env.local
# Edit .env.local with your OPENROUTER_API_KEY

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing.

## How It Works

1. **Setup** — Enter your target role, pick an interview type (Technical/Behavioral/Mixed) and difficulty (Entry/Mid/Senior), set question count, and provide your resume (paste or upload).
2. **Interview** — An AI interviewer asks personalized questions based on your resume. Answer each question in the textarea.
3. **Grading** — After the final answer, the AI grades all responses and returns a score, verdict, and per-question feedback.

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/start` | POST | Generates interview questions based on resume, role, type, and difficulty |
| `/api/answer` | POST | Records an answer and returns the next question (or signals completion) |
| `/api/grade` | POST | Grades all answers and returns score, verdict, and feedback |
| `/api/extract-text` | POST | Extracts text from uploaded PDF, DOCX, or TXT files |

## Project Structure

```
ai-interview-agent/
├── app/
│   ├── api/                    # Next.js API route handlers
│   │   ├── start/route.js
│   │   ├── answer/route.js
│   │   ├── grade/route.js
│   │   └── extract-text/route.js
│   ├── components/             # Presentational React components
│   │   ├── SetupStage.js
│   │   ├── InterviewStage.js
│   │   ├── GradingStage.js
│   │   └── ResultsStage.js
│   ├── hooks/
│   │   └── useInterview.js     # Central interview state management
│   ├── lib/
│   │   ├── constants.js         # Sample resume, type/difficulty enums
│   │   ├── prompt.js            # Prompt factory (interview + grading)
│   │   ├── openrouter.js        # OpenRouter API wrapper
│   │   └── interview-sessions.js # In-memory session store
│   ├── layout.js               # Root layout + metadata
│   ├── globals.css             # Tailwind + custom animations
│   └── page.js                 # Main page (thin shell → stage components)
├── .env.local                  # OpenRouter API key (gitignored)
├── next.config.mjs
├── package.json
└── PROMPT.md                   # Cline development workflow documentation
```

## Development Notes

- The app uses an **in-memory session store** — sessions reset on server restart
- File uploads support `.pdf`, `.docx`, `.md`, and `.txt` (max 10 MB)
- PDF extraction requires pdf.js worker resolution (handled automatically in `extract-text/route.js`)
- See `PROMPT.md` for the full Cline AI-assisted development workflow

## License

MIT — built for the abtalk hackathon.
