# AI Interview Agent — Cline Development Workflow

> **PROMPT.md** — A record of the full chat history with **Cline** (AI coding agent) that
> defined the development workflow for the AI Interview Agent hackathon project.
> This documents the iterative AI-assisted coding process: debugging → testing →
> feature implementation → architecture refactoring → continuous verification.

---

## Session Overview

| Session | Date | Model | Cost | Focus |
|---------|------|-------|------|-------|
| 1 | Aug 9, 12:07–12:23 | Claude Sonnet 5 | $0.49 | Fix: "error when filling details" during interview start |
| 2 | Aug 9, 12:23–12:23 | — | $0.00 | Interrupted — no meaningful content |
| 3 | Aug 9, 12:24–13:26 | DeepSeek (grok-4.5) | $0.24 | Project recovery, 9-item assessment, items 6–9 implementation, Express→Next.js migration |

---

## Session 1: Fixing the Error When Filling In Details

**User prompt:**

> there is something wrong when i use the given example it does not generate questions and shows error check it and solve the issue

### Conversation

> **Cline:** "I've identified the root cause. Let me verify my understanding fully before implementing a fix."

Cline inspected the running processes, Next.js dev logs, and the Express backend. The Next.js
frontend (port 3000) proxies `/api/*` to the Express backend (port 4000) via `next.config.mjs`.
The dev log showed:

```
"Failed to proxy http://localhost:4000/api/start" AggregateError  ← repeated ~30 times
```

**Root cause:** Nothing was listening on port 4000 — the Express backend had crashed/stopped.

**Fix steps:**

1. Started the backend: `node --env-file=.env.local server/index.js` (PID 22628).
2. Tested through the proxy → questions returned successfully.
3. Found a secondary bug: `server/index.js` line 35 sent `[resume redacted]` to the AI
   instead of `${resumeText}` — a leftover debug edit that broke resume personalization.
4. Restored `${resumeText}`, restarted the backend.
5. Full end-to-end test through `localhost:3000`:
   - ✅ Start → 5 questions generated, **personalized** to the resume (references TechCorp, TypeScript, GraphQL, Jest)
   - ✅ Answer → all answers recorded
   - ✅ Grade → score 79, verdict "Hire"
6. Verified `.env.local` (OpenRouter API key) is covered by `.gitignore` — not tracked.

**Key takeaway for judges:** The root cause was a **stopped backend server**, not a code bug.
The frontend proxy silently failed, and the UI showed a generic error. Proper error surfacing
(see Session 3, Improvement #2) would have made this immediately obvious.

---

## Session 3: Project Recovery + Full Architecture Refactor

**User prompt:**

> hey

### Phase 1: Project Discovery (no prior memory)

Cline started fresh — each session is independent with no memory of prior conversations.
It reconstructed the project state by inspecting:

- Git log: `1lavya6774/abtalk-hackathon`, last commit "3rd commit"
- Running processes: Next.js dev on `:3000`, Express backend on `:4000`
- Uncommitted changes in `app/page.js`, `server/index.js`, `server/openrouter.js`
- Server logs showing active testing earlier today

**Cline's summary:** "Found it! Here's the picture of what's in progress:
**Silvine AI interview agent** (abtalk-hackathon) — a Next.js 16.3 app + Express backend."

### Phase 2: Bug Fix Re-confirmation

> **User:** "ok the problem is that it shows error when i fill details"

Cline diagnosed the same root cause (backend not running on port 4000), restarted it,
found and fixed the `[resume redacted]` bug, and verified the full flow end-to-end.

### Phase 3: Frontend Assessment (9 items)

> **User:** "okfor the frontend what do you think should be done"

After reading the full `page.js` (607 lines), `server/index.js`, `server/openrouter.js`,
`server/sessions.js`, and the `lib/` directory, Cline produced a 3-tier assessment:

**🔴 High priority**
1. Interview Type and Difficulty controls are **decorative** — the UI sends them but the backend ignores them
2. Error messages are **swallowed** — hardcoded "Something went wrong" banner

**🟡 Medium priority**
3. Off-by-one label: "Question 1" on the second question
4. No "Grading…" state — silent spinner after last answer
5. `layout.js` still has default Next.js metadata ("Create Next App")

**🟢 Cleanup / nice-to-haves**
6. Dead legacy code: `app/api/interview/route.ts`, `lib/sessions.ts`, `lib/openrouter.ts`, `data/curriculum.json`
7. Monolithic `page.js` (607 lines) — split into components
8. No resume upload — paste-only
9. Deployability: requires Express backend, breaks on Vercel

### Phase 4: Implementing Items 6–9

> **User:** "now net 6 to last point" (items 6 through 9)

#### Build Plan

Cline organized the work into three batches:

**Batch 1 — Shared lib files:**
- `app/lib/constants.js` — `SAMPLE_RESUME`, `INTERVIEW_TYPES`, `DIFFICULTIES`
- `app/lib/prompt.js` — `buildInterviewPrompt()` and `buildGradePrompt()` with full type/difficulty guidance
- `app/lib/openrouter.js` — OpenAI SDK wrapper to OpenRouter
- `app/lib/interview-sessions.js` — in-memory `Map`-based session store

**Batch 2 — Next.js API route handlers:**
- `app/api/start/route.js` — POST: generates questions via OpenRouter, creates session
- `app/api/answer/route.js` — POST: records answer, returns next question or "done"
- `app/api/grade/route.js` — POST: grades all answers, returns score/verdict/feedback
- `app/api/extract-text/route.js` — POST: multipart file upload, extracts text from PDF/DOCX/TXT

**Batch 3 — Frontend components + hook:**
- `app/hooks/useInterview.js` — central state management hook (stage, questions, answers, grading, errors)
- `app/components/SetupStage.js` — setup form (role, type, difficulty, question count, resume upload/paste)
- `app/components/InterviewStage.js` — question display + answer textarea
- `app/components/GradingStage.js` — animated grading screen with cycling status messages
- `app/components/ResultsStage.js` — score, verdict, per-question breakdown
- `app/page.js` — thin shell delegating to stage components

#### Debugging Log (real-time)

During implementation, Cline hit and resolved several real issues:

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| SSR error in `SetupStage.js` line 342 | JSX had one extra `</div>` | ESLint found it → removed the spurious closing tag |
| Stale dev server on `:3000` | Old process (PID 21596) holding the port with old rewrite config | Killed all node processes, started fresh |
| `pdf-parse` v2 export shape | Package exports `PDFParse` class, not default export | Updated import to `import { PDFParse } from "pdf-parse"` |
| PDF worker resolution fails in Next runtime | pdf.js worker path not found; package exports map hides it | `resolvePdfWorkerSrc()` derives path from `require.resolve("pdf-parse")` + fallback to `node_modules/pdf-parse/dist/esm/pdf.worker.mjs` |
| `curl -Form` not available | PowerShell 5.1 doesn't have curl's `-Form` flag | Switched to `curl.exe` |
| PDF extraction still failing after worker fix | pdf.js fallback worker still being used | Used `PDFParse.setWorker(workerSrc)` at module load time in route handler |
| `.txt` extraction works, PDF fails | Different code paths — txt is raw buffer, PDF needs worker | Worker path resolved via `pathToFileURL()` conversion for Next.js SSR compatibility |

#### Verification Steps

After all code was in place:
1. `GET /` → **200** — refactored page loads
2. ESLint → **clean** on all edited files
3. Full API flow without Express backend: start → 5 answers → grade → score 79, verdict "Hire"
4. `.txt` file upload extraction → text extracted successfully
5. PDF file upload extraction → text extracted successfully (after worker path fix)
6. `npm run dev` runs everything on `:3000` — no separate backend needed

### Phase 5: Final Architecture

The app was fully migrated from a **dual-server** (Next.js + Express) architecture to a
**single Next.js app** with built-in route handlers:

```
ai-interview-agent/
├── app/
│   ├── api/
│   │   ├── start/route.js        # Generate interview questions (OpenRouter)
│   │   ├── answer/route.js       # Record an answer, return next or done
│   │   ├── grade/route.js        # Grade all answers → score/verdict/feedback
│   │   └── extract-text/route.js # PDF/DOCX/TXT → text (multipart)
│   ├── components/
│   │   ├── SetupStage.js         # Role, type, difficulty, count, resume upload
│   │   ├── InterviewStage.js     # Question display + answer textarea
│   │   ├── GradingStage.js       # Animated grading screen
│   │   └── ResultsStage.js       # Score, verdict, per-question breakdown
│   ├── hooks/
│   │   └── useInterview.js       # Central state + API orchestration
│   ├── lib/
│   │   ├── constants.js          # Sample resume, type/difficulty enums
│   │   ├── prompt.js             # Prompt factory (interview + grading)
│   │   ├── openrouter.js         # OpenAI SDK → OpenRouter wrapper
│   │   └── interview-sessions.js # In-memory session store (Map + UUID)
│   ├── layout.js                 # Metadata: "AI Interview Agent"
│   ├── globals.css               # Tailwind + custom animations (shake, fade-in)
│   └── page.js                   # Thin shell → stage components
├── .env.local                    # OPENROUTER_API_KEY (gitignored)
├── next.config.mjs               # Empty config — no proxy needed
├── package.json
└── PROMPT.md                     # This document
```

### How to Run

```bash
npm install
npm run dev       # Everything on http://localhost:3000
```

No separate backend server is needed. The entire app runs on Next.js alone and is
deployable to Vercel.

---

## AI Usage Workflow Pattern

The two Cline sessions demonstrate a consistent, verifiable development cycle:

```
1. Understand  →  Inspect codebase, git history, logs, running processes
2. Diagnose   →  Trace the error to its root cause (proxy failure, redacted data, worker path)
3. Fix        →  Apply the smallest correct change, verified by tests
4. Expand     →  Address the user's next request with the same diagnostic cycle
5. Refactor   →  After features work, clean up (dead code, component split, migration)
6. Re-verify  →  Lint → compile → end-to-end test after every batch of changes
```

**Key characteristics demonstrated:**
- **No assumptions** — every claim verified with a tool call (logs, diffs, curl tests, ESLint)
- **Real environment** — tests run against the actual running server, not unit stubs
- **Iterative** — each assistant turn is small, verified, and builds on the last
- **Security-conscious** — `.env.local` verified as gitignored before any push
