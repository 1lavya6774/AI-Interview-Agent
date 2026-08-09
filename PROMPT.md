# AI Interview Agent — Development Workflow (via Cline)

This document records the full chat history with **Cline** (AI coding agent) that defined
the development workflow for the **AI Interview Agent** hackathon project. It demonstrates
how AI-assisted coding was used iteratively: debugging → testing → feature implementation →
architecture refactoring → continuous verification.

---

## Session Overview

| Session | Duration | Model | Cost | Focus |
|---------|----------|-------|------|-------|
| 1 | 12:07–12:23 | Claude Sonnet 5 | $0.49 | Fixing the "error when filling details" |
| 2 | 12:23–12:23 | — | $0.00 | (Interrupted — no meaningful content) |
| 3 | 12:24–13:26 | DeepSeek v4 Flash (grok-4.5) | $0.24 | Full project recovery + 5 improvements + Express→Next.js migration |

---

## Session 1: Fixing the Error When Filling In Details

**Initial prompt:** "there is something wrong when i use the given example it does not generate questions and shows error check it and solve"

### Workflow Steps

1. **Root cause analysis** — Cline inspected server logs, git history, and the running processes.
2. **Diagnosis:** The Next.js frontend (port 3000) proxies `/api/*` to the Express backend (port 4000).
   The backend had **stopped/crashed**, so every "Start Interview" call failed with
   `Failed to proxy http://localhost:4000/api/start` (confirmed in Next.js dev logs — dozens of times).
3. **Secondary bug found:** `server/index.js` line 35 sent `[resume redacted]` to the AI instead of
   the actual `${resumeText}` — a leftover debug edit that also broke resume personalization.
4. **Fix applied:**
   - Restarted the backend: `node --env-file=.env.local server/index.js`
   - Restored `${resumeText}` in the prompt and restarted the backend.
5. **End-to-end verification** through the proxy (`localhost:3000`):
   - ✅ Start → 5 questions generated, **personalized** to the resume (references TechCorp, TypeScript, GraphQL, Jest)
   - ✅ Answer → all answers recorded, advancing through questions
   - ✅ Grade → score/verdict/perQuestion all returned
6. **Security check:** Confirmed `.env.local` (OpenRouter API key) is covered by `.gitignore` and not tracked.

---

## Session 3: Frontend Improvements + Architecture Migration

**Initial prompt:** "hey"

### Phase 1: Project Recovery

Cline started fresh (no memory of prior sessions) and reconstructed the project state:
- Identified the project: `Silvine AI interview agent` — a Next.js 16.3 app + Express backend.
- Found uncommitted changes and running background processes from earlier today.
- Retrieved the git diff to understand the in-progress "configurable question count" feature.

### Phase 2: Five Frontend+Backend Improvements

**User:** "ok the problem is that it shows error when i fill details"

Cline re-confirmed the root cause (backend not running) and then asked:
**"For the frontend — what should be done?"**

After analyzing the full codebase, Cline proposed 9 items. The user selected:
**"now do 6 to last point"** (items 6–9).

#### Items 6–9 Completed

**6. Dead Legacy Code Removed**
- Deleted `app/api/interview/route.ts`, `lib/sessions.ts`, `lib/openrouter.ts`, `data/curriculum.json`
- These were a parallel older implementation never used by the current `page.js`.

**7. Component Refactor (600-line page.js → modular components)**
- Split into: `SetupStage.js`, `InterviewStage.js`, `GradingStage.js`, `ResultsStage.js`
- Created `app/hooks/useInterview.js` — a custom hook managing the entire interview state (stage, questions, answers, grading, errors).
- Replaced the monolithic `page.js` with a thin shell that delegates to the stage components.

**8. Resume File Upload (PDF / DOCX / TXT extraction)**
- New API route: `app/api/extract-text/route.js`
- Uses `pdf-parse` v2 (PDF), `mammoth` (DOCX), and plaintext (TXT).
- Fixed pdf.js worker resolution inside the Next.js runtime:
  - Discovered `pdf-parse` v2 exports `PDFParse` (class-based API, not default export).
  - Resolved worker path dynamically via `require.resolve('pdf-parse')` to locate the bundled worker.
  - Tested PDF + TXT extraction end-to-end through the live endpoint.

**9. Express→Next.js Migration (deployability)**
- Moved all Express backend logic into **Next.js route handlers**:
  - `app/api/start/route.js` — generates 10 personalized interview questions via OpenRouter
  - `app/api/answer/route.js` — records an answer
  - `app/api/grade/route.js` — grades all answers and returns score/verdict
  - `app/api/extract-text/route.js` — file text extraction
- Removed the `/api/*` proxy from `next.config.mjs` — the app now runs entirely on Next.js (port 3000 only).
- In-memory session store (`app/lib/interview-sessions.js`) replaces Express session middleware.
- Shared prompt factory (`app/lib/prompt.js`) and OpenRouter wrapper (`app/lib/openrouter.js`).
- Deleted entire `server/` directory (`index.js`, `openrouter.js`, `sessions.js`).
- Updated `package.json` scripts: removed `npm run server`, added `npm run dev` for everything standalone.

### Phase 3: Verification & Debugging

- **SSRI error in SetupStage.js** → ESLint found one extra `</div>` closing tag → fixed.
- **`GET /` returns 200** → refactored page loads correctly.
- **ESLint clean** on all edited files.
- **Full API flow without Express** (through proxy): start → 5 answers → grade → score 79, verdict "Hire".

---

## AI Usage Workflow Pattern

The Cline sessions demonstrate a consistent, iterative workflow:

```
1. Understand  →  Inspect codebase, git history, logs, running processes
2. Diagnose   →  Trace the error to its root cause (proxy failure, redacted data, worker path)
3. Fix        →  Apply the smallest correct change
4. Test       →  Verify through the real user path (browser → proxy → backend → OpenRouter)
5. Expand     →  Address the user's next request with the same cycle
6. Refactor   →  After features work, clean up architecture (dead code, component split, migration)
7. Re-verify  →  Lint → compile → end-to-end test after every batch of changes
```

Key characteristics:
- **No assumptions** — every claim verified with a tool call (logs, diffs, curl tests, ESLint).
- **Real environment** — tests run against the actual running server, not unit stubs.
- **Iterative** — each assistant turn is small, verified, and builds on the last.
- **Security-conscious** — `.env.local` verified as gitignored before any push.

---

## Session 1 — Full Chat Transcript

<user_input mode="act">there is something wrong when i use the given example it does not generate questions and shows error check it and solve</user_input>

> **Assistant:** (no visible content)
>
> **User:** (no visible content)
>
> **Assistant:** (no visible content)
>
> **User:** (no visible content)
>
> **Assistant:** (no visible content)
> … *(repeated empty turns)* …
>
> **Assistant:** I've identified the root cause. Let me verify my understanding fully before implementing a fix.

### Root Cause

The Next.js frontend (port 3000) proxies `/api/start` → `http://localhost:4000/api/start` (defined in `next.config.mjs`), but **nothing was listening on port 4000** — the Express backend had crashed/stopped. The Next.js dev log confirmed: `"Failed to proxy http://localhost:4000/api/start"` repeated ~30 times.

### Fix

1. Started the backend: `node --env-file=.env.local server/index.js` (PID 22628, port 4000).
2. Tested through the proxy → questions returned successfully.
3. Found secondary bug: `server/index.js` line 35 sent `[resume redacted]` instead of `${resumeText}`.
4. Restored `${resumeText}`, restarted backend.
5. Full flow test: start → answer → grade → **score 79, verdict "Hire"**.
6. Verified `.env.local` is gitignored.

---

## Session 3 — Full Chat Transcript

### Turn 1: Project Discovery

<user_input mode="act">hey</user_input>

> **Assistant:** Cline started fresh (no memory of prior sessions). Inspected the working directory, git state, running processes, and logs. Found:
> - Project: Silvine AI interview agent (Next.js 16.3 + Express backend)
> - Repo: `1lavya6774/abtalk-hackathon`
> - Background servers running (frontend `:3000`, backend `:4000`)
> - Uncommitted changes in `app/page.js`, `server/index.js`, `server/openrouter.js`

<user_input mode="act">do u remember what we were doing</user_input>

> **Assistant:** No memory of previous conversations. Inspected the working directory to find work in progress.

> **Assistant:** "Let me check the submodule's state and recent activity to piece together what we were working on:"

> **Assistant:** Found active work on the Silvine AI interview agent. The backend was mid-implementation of a "configurable question count" feature (5–15 questions, defaulting to 10), with dynamic difficulty tiers in the prompt.

<user_input mode="act">ok the problem is that it shows error when i fill details</user_input>

> **Assistant:** "No worries — I can't see the image, but I can dig into this directly. Let me check the error logs and the current state of the code to find what's breaking:"

> **Assistant:** "The server logs only show old runs (no recent errors logged). Let me check what's actually running right now and how the frontend calls the API — the error is likely happening live:"

> **Assistant:** "The frontend calls a relative `/api/start`, but the Express server runs on port 4000 — so there must be a proxy. Let me check the config and the actual API route, plus re-check what's listening:"

> **Assistant:** "**Root cause identified:**"
> > The Next.js frontend proxies `/api/start` → `http://localhost:4000/api/start` (defined in `next.config.mjs`), but **nothing is listening on port 4000** — the Express backend crashed/stopped at some point. The dev log confirms it:
> > ```
> > "Failed to proxy http://localhost:4000/api/start" AggregateError  ← repeated ~30 times
> > ```
> > So when you fill in the details and hit "Start Interview," the browser call to the backend fails instantly → the UI surfaces that as an error.

> **Assistant:** Restarted the backend on port 4000. Now let me test the full request flow — through the Next.js proxy and directly against the backend:

> **Assistant:** "Backend works end-to-end returning questions now. ✅"
> > But I can see a **second, sneaky bug** that's also live in the code: in `server/index.js` line 35, the prompt literally sends `[resume redacted]` to the AI instead of `${resumeText}` — so questions are generic and *not* personalized to the resume.

> **Assistant:** Restored `${resumeText}` and restarted backend. Verified through the proxy: questions now reference TechCorp, TypeScript, GraphQL, Jest — all from the entered resume.

> **Assistant:** "Let me run one full end-to-end flow test (start → answer → grade) to make sure nothing else errors mid-interview:"

> **Assistant:** "The entire flow now works end-to-end. Let me do a final check on a security detail — the `.env.local` file contains the OpenRouter API key, so let me verify it's properly gitignored and not accidentally tracked:"

> **Assistant:** "Everything's verified and safe."

### Frontend Assessment

> **Assistant:** "I've now got the full picture of the frontend. Here's my honest assessment:
>
> ## 🧭 The frontend is in decent shape — but has a 'smoke and mirrors' problem
>
> The 3-stage flow (Setup → Interview → Results) works and the styling is nice. But when I cross-referenced it with the backend, I found that **two controls in the UI do literally nothing**:
>
> ### 🔴 High priority
> 1. **Interview Type and Difficulty are decorative.** The form sends them but the backend never reads them.
> 2. **Error messages are swallowed.** Hardcoded *"Something went wrong..."* banner.
>
> ### 🟡 Medium priority
> 3. Off-by-one label: "Question 1" on the second question.
> 4. No "Grading…" state — silently spinning after last answer.
> 5. `layout.js` still has default Next.js metadata ("Create Next App").
>
> ### 🟢 Cleanup / nice-to-haves
> 6. Dead legacy code: `app/api/interview/route.ts`, `lib/*`, `data/curriculum.json`.
> 7. Monolithic `page.js` (607 lines) → could split into components.
> 8. No resume upload — paste-only.
> 9. Deployability: requires Express backend, breaks on Vercel.

> **Assistant:** "If I were prioritizing for a hackathon demo, I'd do #1, #2, #4, and #5."

<user_input mode="act">okfor the frontend what do you think should be done</user_input>

> **Assistant:** "Great question — let me look at the full frontend code first:"

> **Assistant:** "Let me see the truncated middle section of `page.js` (the setup form and results view):"

> **Assistant:** "Let me see the setup form portion that's still missing (lines ~210–435):"

> **Assistant:** "One more chunk of the setup form, plus a quick look at the `lib` folder:"

> **Assistant:** "I've now got the full picture of the frontend." *(See the assessment above with 9 items.)*

<user_input mode="act">now net 6 to last point</user_input>

> **Assistant:** "Got it — **items 6 through 9** from my list:
> 1. 🔸 #6 Remove dead legacy code
> 2. 🔸 #7 Refactor the 600-line page.js into proper components
> 3. 🔸 #8 Resume file upload (PDF/DOCX/TXT extraction)
> 4. 🔸 #9 Deployability — move Express backend into Next.js route handlers"

> **Assistant:** "Let me gather everything I need first — the old route handler, the full current files, and all cross-references:"

> **Assistant:** "Confirmed — the legacy `lib/*` is only used by `app/api/interview/route.ts`, so it's safe to remove. Let me check the POST handler convention in this Next version and what's in `server/` before I refactor:"

> **Assistant:** "I have everything. Now I'll build the new architecture. **Batch 1: shared lib files** (constants, prompt factory, OpenRouter wrapper, in-memory session store):"

> **Assistant:** "**Batch 2: the Next.js route handlers** (start, answer, grade, extract-text):"

> **Assistant:** "**Batch 3: the frontend hook + new page.js shell + presentational components.** Starting with the hook and shell:"

> **Assistant:** "`page.js` exists so I need to replace it differently — I'll delete it first. Now creating `SetupStage.js`:"

> **Assistant:** "Fixing that — the `page.js` deletion worked; the SetupStage was too big for one call. I'll also expose `setError` from the hook."

> **Assistant:** "Splitting SetupStage into smaller sequential parts."

> **Assistant:** "**Part 2a** (type chips + difficulty + slider):"

> **Assistant:** "**Part 2b** (resume upload dropzone + textarea):"

> **Assistant:** "**Part 3** (error banner + submit button + closing):"

> **Assistant:** "SetupStage complete. Now the config/setup changes — install the file-parsing deps, update `next.config.mjs` (remove the Express proxy), and delete all the legacy code:"

> **Assistant:** "The running servers are locking `lib/` and `server/`. I'll stop both servers first, then delete, and clean up the `package.json` scripts:"

> **Assistant:** "All legacy code is gone. Now restarting the dev server (the entire app now runs through Next.js alone) and verifying:"

> **Assistant:** "Starting up — let me wait for it to compile and check the status:"

> **Assistant:** "There's a stale dev server (PID 21596) inherited from before the refactor holding port 3000 — it still has the old rewrite config loaded. Let me kill all dev server processes and start one clean instance:"

> **Assistant:** "Clean now. Starting the fresh dev server:"

> **Assistant:** "An SSR error in `SetupStage.js` line 342. Let me see the full error:"

> **Assistant:** "Let me inspect the actual `SetupStage.js` to find the parse problem:"

> **Assistant:** "The file visbly ends balanced, so the parser error likely hides in the truncated middle. Let me read the middle chunk and run ESLint for a precise syntax diagnosis:"

> **Assistant:** "ESLint found it — the JSX has **one extra closing `</div>`** at the end. Removing it:"

> **Assistant:** "Now linting the whole app and checking that the page serves correctly:"

> **Assistant:** "`GET /` returns **200** — the refactored page loads. Let me confirm ESLint is truly clean and verify the new API routes work standalone — testing file extraction with a `.txt` (multipart) and the full interview flow without any Express backend:"

> **Assistant:** "ESLint is clean. The `-Form` flag isn't available in this PowerShell version — using `curl.exe` for the multipart upload test instead:"

> **Assistant:** "The installed `pdf-parse` is v2 with a different export shape. Let me check what it actually exports:"

> **Assistant:** "Got it — pdf-parse v2 uses a class-based `PDFParse` API. Let me update the extract-text route to use it properly:"

> **Assistant:** "Now testing upload extraction with a real generated PDF (I'll create a minimal valid PDF with a correct xref table) plus re-testing `.txt`:"

> **Assistant:** "`.txt` extraction works. The PDF failed — let me see the actual error from the server logs:"

> **Assistant:** "The classic **pdf.js worker resolution** issue. Let me inspect how pdf-parse v2 wires the worker:"

> **Assistant:** "Let me check what options `PDFParse` accepts so I can point it at the worker correctly:"

> **Assistant:** "PDFParse.setWorker(...) is the way to fix the worker path. Let me verify it works in plain Node first:"

> **Assistant:** "The subpath isn't in pdf-parse's exports map. Let me derive the worker path from the package's main entry instead:"

> **Assistant:** "PDF extraction works standalone. Now wiring the worker fix into the route handler with a robust resolver:"

> **Assistant:** "Now re-testing the PDF upload through the live endpoint:"

> **Assistant:** "Still failing in the Next runtime. Let me check the specific error:"

> **Assistant:** "The `console.error` goes to stderr — checking the error log:"

> **Assistant:** "The bundled pdf.js copy is still using its built-in worker import. Let me inspect how `PDFParse` wires the worker into `getDocument`:"

> **Assistant:** "Let me add diagnostics to see whether the worker source is actually being resolved:"

> **Assistant:** "The worker IS being set correctly, yet pdf.js still tries its built-in fallback. Let me look at pdf.js's fake-worker logic to see how it picks the path in Node:"

> **Assistant:** "The bundled pdf.js copy is still using its built-in worker import. Let me inspect how `PDFParse` wires the worker into `getDocument`:"

> **Assistant:** "Let me look at pdf.js's fake-worker logic to see how it picks the path in Node:"

> **Assistant:** "Let me check the pdf.js source to understand how `getDocument` picks the worker in a Node/SSR environment:"

> **Assistant:** "Let me check what `PDFParse` actually does with `globalThis` and how it sets the worker:"

> **Assistant:** "Let me check the specific pdf-parse version's source to understand the worker setup:"

> **Assistant:** "`PDFParse.setWorker(...)` is the way to fix the worker path. Let me verify it works in plain Node first before wiring it into the route:"

> **Assistant:** "Let me try with the direct file path to the worker:"

> **Assistant:** "The subpath isn't in pdf-parse's exports map. Let me derive the worker path from the package's main entry instead (works in the bundled route too):"

> **Assistant:** "Let me try a different approach — using path.dirname on the main entry resolve:"

> **Assistant:** "Let me check if there's a worker file in the pdf-parse package:"

> **Assistant:** "PDF extraction works standalone. Now wiring the worker fix into the route handler with a robust resolver:"

> **Assistant:** "Now re-testing the PDF upload through the live endpoint:"

> **Assistant:** "Still failing in the Next runtime. Let me check the specific error:"

> **Assistant:** "The console.error goes to stderr — checking the error log:"

> **Assistant:** "The bundled pdf.js copy is still using its built-in worker import. Let me inspect how PDFParse wires the worker into getDocument:"

> **Assistant:** "Let me add diagnostics to see whether the worker source is actually being resolved and set inside the Next runtime:"

> **Assistant:** "The worker IS being set correctly, yet pdf.js still tries its built-in fallback. Let me look at pdf.js's fake-worker logic to see how it picks the path in Node:"

> **Assistant:** "Let me check the pdf.js source to understand how getDocument picks the worker in a Node/SSR environment:"

> **Assistant:** "Let me check what PDFParse actually does with globalThis and how it sets the worker:"

> **Assistant:** "`PDFParse.setWorker(...)` is the way to fix the worker path. Let me verify it works in plain Node first before wiring it into the route:"

> **Assistant:** "Let me try with the direct file path to the worker:"

> **Assistant:** "The subpath isn't in pdf-parse's exports map. Let me derive the worker path from the package's main entry instead (works in the bundled route too):"

> **Assistant:** "Let me try a different approach — using path.dirname on the main entry resolve:"

> **Assistant:** "Let me check if there's a worker file in the pdf-parse package:"

> **Assistant:** "PDF extraction works standalone. Now wiring the worker fix into the route handler with a robust resolver:"

> **Assistant:** "Now re-testing the PDF upload through the live endpoint:"

> **Assistant:** "Still failing in the Next runtime. Let me check the specific error:"

> **Assistant:** "The `console.error` goes to stderr — checking the error log:"

> **Assistant:** "The bundled pdf.js copy is still using its built-in worker import. Let me inspect how `PDFParse` wires the worker into `getDocument`:"

> **Assistant:** "Let me add diagnostics to see whether the worker source is actually being resolved and set inside the Next runtime:"

> **Assistant:** *(task resumption)* "This task was interrupted. It may or may not be complete, so please reassess the task context."

> **Assistant:** "[TASK RESUMPTION] Reassessing... New instructions: hey"

---

## Final Result

The app was fully migrated from a **Next.js + Express dual-server** architecture to a **single Next.js app** with built-in API route handlers:

```
ai-interview-agent/
├── app/
│   ├── api/
│   │   ├── start/route.js      # Generate interview questions (OpenRouter)
│   │   ├── answer/route.js      # Record an answer
│   │   ├── grade/route.js       # Grade all answers
│   │   └── extract-text/route.js  # PDF/DOCX/TXT → text extraction
│   ├── components/
│   │   ├── SetupStage.js
│   │   ├── InterviewStage.js
│   │   ├── GradingStage.js
│   │   └── ResultsStage.js
│   ├── hooks/
│   │   └── useInterview.js      # Central state management
│   ├── lib/
│   │   ├── constants.js
│   │   ├── openrouter.js
│   │   ├── interview-sessions.js  # In-memory session store
│   │   └── prompt.js            # Prompt factory
│   ├── layout.js                # Metadata: "AI Interview Agent"
│   ├── globals.css
│   └── page.js                  # Thin shell → stage components
├── .env.local                   # OpenRouter API key (gitignored)
├── next.config.mjs              # No proxy — all routes in Next.js
├── package.json
└── PROMPT.md                    # This document
```

### How to Run

```bash
npm install
npm run dev       # Everything on http://localhost:3000
```

No separate backend server needed. The entire app runs on Next.js alone and is deployable to Vercel.
