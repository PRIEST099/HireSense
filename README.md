# HireSense AI

**AI-Powered Talent Profile Screening for Smarter, Faster, and Fairer Hiring**

HireSense AI is a production-ready recruitment screening platform that enables recruiters to automatically score, rank, and shortlist job applicants using artificial intelligence — while keeping humans in full control of final hiring decisions.

> **Live Application:** [https://hire-sense-omega.vercel.app](https://hire-sense-omega.vercel.app)
> **Presentation Deck:** [View Pitch Deck](./presentation/HireSense-Umurava-Hackathon.pptx)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [AI Decision Flow](#ai-decision-flow)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Assumptions and Limitations](#assumptions-and-limitations)

---

## Project Overview

Recruiters today face two major challenges: **high application volumes** that dramatically increase time-to-hire, and the **difficulty of objectively comparing candidates** across diverse profiles and formats.

HireSense AI addresses both by providing a system that:

1. **Understands job requirements** — Recruiters define roles with structured skills, experience levels, education, and custom screening weights.
2. **Analyzes multiple applicants at once** — Candidates can be added manually, uploaded via CSV/Excel spreadsheets, or parsed from PDF resumes.
3. **Produces a ranked shortlist** — AI scores every candidate on a 0–100 scale across four dimensions and returns a configurable Top 10 or Top 20 shortlist.
4. **Explains every decision** — Each shortlisted candidate includes clear reasoning covering strengths, gaps, match confidence, and a final recommendation — ensuring full transparency and recruiter trust.

### Usage Scenarios

| Scenario | Input | AI Output |
|---|---|---|
| **Structured Talent Profiles** | Job details + structured candidate profiles (manual entry or platform data) | Scored, ranked shortlist with per-candidate explanations |
| **External Job Boards** | Job details + uploaded CSV/Excel spreadsheets or PDF resumes | Parsed profiles → scored, ranked shortlist with per-candidate explanations |

---

## Key Features

| Feature | Description |
|---|---|
| **Job Management** | Create and configure jobs with a 3-step wizard: basics, requirements, and screening configuration |
| **Multi-Source Candidate Ingestion** | Manual profile entry, CSV/Excel upload with smart column mapping (30+ header aliases), and PDF resume upload with AI-powered parsing |
| **AI-Powered Screening** | Asynchronous 3-stage pipeline: resume parsing → individual scoring → comparative ranking |
| **Weighted Scoring** | Customizable weights across four dimensions (skills, experience, education, culture fit) that must sum to 100% |
| **Explainable Results** | Every candidate receives: overall score, dimensional breakdown, strengths (up to 3), gaps (up to 3), confidence score, natural-language reasoning, and a recommendation category |
| **Human-in-the-Loop Decisions** | Recruiters make final calls — Shortlist, Interview, Reject, or Pending — on every candidate. No automated hiring. |
| **Configurable Shortlist Size** | Top 10 or Top 20 candidates per screening session |
| **CSV Export** | Export full screening results including scores, reasoning, and recruiter decisions |
| **Audit Trail** | Every screening result stores the AI model used, prompt version, and processing time for full reproducibility |
| **Authentication** | Secure credential-based authentication with bcrypt password hashing and JWT session management |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ Landing  │  │   Job    │  │ Candidate │  │   Screening   │  │
│  │   Page   │  │ Manager  │  │  Manager  │  │   Results     │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
│         Redux Toolkit (State Management)                        │
│         3 Slices: jobs | candidates | screening                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Next.js API Routes)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │   Auth   │  │   Jobs   │  │ Candidates│  │  Screening    │  │
│  │  Routes  │  │  CRUD    │  │  + Upload │  │  Orchestrator │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────┬───────┘  │
│         Zod Validation │ NextAuth.js (JWT)           │          │
└────────────────────────┼─────────────────────────────┼──────────┘
                         │                             │
┌────────────────────────▼────┐   ┌────────────────────▼──────────┐
│      DATABASE (MongoDB)     │   │        AI LAYER (Gemini)      │
│  ┌───────┐ ┌────────────┐  │   │  ┌────────────────────────┐   │
│  │ Users │ │    Jobs     │  │   │  │  Stage 1: Resume Parse │   │
│  ├───────┤ ├────────────┤  │   │  │  Stage 2: Score (×3)   │   │
│  │Candid.│ │  Sessions  │  │   │  │  Stage 3: Rank         │   │
│  ├───────┤ ├────────────┤  │   │  └────────────────────────┘   │
│  │Results│ │            │  │   │  Gemini 2.0 Flash (fast)      │
│  └───────┘ └────────────┘  │   │  Gemini 2.5 Pro (smart)       │
│  Mongoose ODM              │   │  Token-bucket rate limiting    │
└────────────────────────────┘   └────────────────────────────────┘
```

---

## AI Decision Flow

HireSense AI uses a **3-stage pipeline** powered by the **Gemini API** to evaluate candidates. Every stage is documented with prompt version tracking (`v1.0.0`) for reproducibility.

### Stage 1: Resume Parsing (PDF uploads only)

When a recruiter uploads a PDF resume, the AI extracts structured data:

```
PDF File → pdf-parse (text extraction) → Gemini 2.0 Flash → Structured Profile
```

- Extracts: name, email, phone, location, skills (with proficiency level), experience, education, certifications, languages
- Infers skill levels based on context (e.g., years mentioned, project complexity)
- Calculates total years of experience
- Falls back to storing raw text if AI parsing fails — no data is lost

### Stage 2: Individual Candidate Scoring

Each candidate is scored independently against the job requirements:

```
Candidate Profile + Job Requirements + Screening Weights → Gemini → Scored Result
```

**Scoring Rubric:**

| Score Range | Category | Meaning |
|---|---|---|
| 90–100 | Exceeds | Exceeds all requirements significantly |
| 70–89 | Strong | Meets most requirements well |
| 50–69 | Partial | Meets some requirements |
| 30–49 | Weak | Meets few requirements |
| 0–29 | Poor | Does not meet requirements |

**Four Scoring Dimensions** (default weights):
- Skills Match — 40%
- Experience Match — 30%
- Education Match — 20%
- Culture Fit Match — 10%

Weights are fully customizable per job and must sum to 100%.

**Output per candidate:**
- Overall score (0–100)
- Dimensional breakdown (0–100 each)
- Up to 3 strengths
- Up to 3 gaps/risks
- Recommendation: `strong_match` | `good_match` | `partial_match` | `weak_match`
- Natural-language reasoning (2–3 sentences)
- AI confidence score (0–100)

**Processing details:**
- Batch concurrency: 3 candidates scored in parallel
- Retry logic: up to 2 retries with exponential backoff (1s → 2s → 4s)
- Zod schema validation on every AI response to ensure structural integrity

### Stage 3: Comparative Ranking

After individual scoring, all candidates are evaluated together:

```
All Scored Candidates → Gemini 2.5 Pro → Final Rankings with Adjustments
```

- Compares candidates relative to each other (not just against the job)
- May adjust individual scores by ±5 points for consistency
- Produces final rank ordering with adjustment reasoning
- Ensures the shortlist reflects true relative merit

### Anti-Hallucination Safeguards

- Prompts explicitly instruct the AI to score only on provided evidence
- Confidence scores flag uncertain assessments
- Every output is validated against a strict Zod schema before storage
- AI model name, prompt version, and processing time are recorded for every result

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Language** | TypeScript | 5.x |
| **Frontend** | Next.js (App Router) | 16.2.2 |
| **UI Framework** | React | 19.2.4 |
| **State Management** | Redux Toolkit + React-Redux | 2.11.2 / 9.2.0 |
| **Styling** | Tailwind CSS | 4.x |
| **Icons** | Lucide React | 1.7.0 |
| **Backend** | Next.js API Routes (Node.js) | 16.2.2 |
| **Database** | MongoDB (Mongoose ODM) | 9.3.3 |
| **AI / LLM** | Google Generative AI (Gemini API) | 0.24.1 |
| **Authentication** | NextAuth.js (JWT strategy) | 5.0.0-beta.30 |
| **Validation** | Zod | 4.3.6 |
| **PDF Parsing** | pdf-parse | 2.4.5 |
| **CSV Parsing** | PapaParse | 5.5.3 |
| **Excel Parsing** | XLSX (SheetJS) | 0.18.5 |
| **File Upload UI** | react-dropzone | 15.0.0 |
| **Password Hashing** | bcryptjs (12 rounds) | 3.0.3 |
| **Deployment** | Vercel (Frontend + API) | — |
| **Database Hosting** | MongoDB Atlas | — |

---

## Database Schema

HireSense uses 5 MongoDB collections:

### Users
| Field | Type | Details |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase |
| passwordHash | String | bcrypt, 12 rounds |
| company | String | Required |
| role | Enum | `recruiter` \| `admin` (default: `recruiter`) |

### Jobs
| Field | Type | Details |
|---|---|---|
| userId | ObjectId | Reference to User |
| title, company, location | String | Required |
| department | String | Optional |
| type | Enum | `full-time` \| `part-time` \| `contract` \| `internship` |
| description | String | Required |
| requirements | Object | `skills[]`, `experience {min, max}`, `education`, `certifications[]`, `languages[]` |
| preferences | Object | `skills[]`, `traits[]` |
| salary | Object | `min`, `max`, `currency` |
| status | Enum | `draft` \| `open` \| `screening` \| `closed` |
| screeningConfig | Object | `shortlistSize (10\|20)`, `weightSkills (40)`, `weightExperience (30)`, `weightEducation (20)`, `weightCultureFit (10)` |

### Candidates
| Field | Type | Details |
|---|---|---|
| jobId | ObjectId | Reference to Job |
| source | Enum | `platform` \| `csv` \| `excel` \| `resume` |
| profile | Object | `name`, `email`, `phone`, `location`, `linkedIn`, `portfolio`, `summary`, `skills[]`, `experience[]`, `education[]`, `certifications[]`, `languages[]`, `totalYearsExperience` |
| rawResumeText | String | Preserved for fallback review |
| rawCsvRow | Mixed | Original CSV/Excel row data |
| profileParsedByAI | Boolean | Whether AI extracted the profile |

### Screening Sessions
| Field | Type | Details |
|---|---|---|
| jobId, userId | ObjectId | References |
| status | Enum | `pending` \| `processing` \| `completed` \| `failed` |
| totalCandidates | Number | Count at session start |
| processedCandidates | Number | Progress counter |
| shortlistSize | Number | 10 or 20 |
| startedAt, completedAt | Date | Timing |
| error | String | Error message if failed |

### Screening Results
| Field | Type | Details |
|---|---|---|
| jobId, candidateId, sessionId | ObjectId | References |
| overallScore | Number | 0–100 |
| breakdown | Object | `skillsMatch`, `experienceMatch`, `educationMatch`, `cultureFitMatch` (each 0–100) |
| rank | Number | Final position |
| strengths, gaps | String[] | Up to 3 each |
| recommendation | Enum | `strong_match` \| `good_match` \| `partial_match` \| `weak_match` |
| reasoning | String | 2–3 sentence explanation |
| confidenceScore | Number | 0–100 |
| recruiterDecision | Enum | `pending` \| `shortlisted` \| `rejected` \| `interview` |
| aiModel | String | Which model produced this result |
| promptVersion | String | Prompt version used (e.g., `1.0.0`) |
| processingTimeMs | Number | Execution time |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new recruiter account |
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign-in (credentials + JWT) |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | List all jobs for the authenticated user |
| `POST` | `/api/jobs` | Create a new job with validation |
| `GET` | `/api/jobs/[jobId]` | Get job details with candidate count and latest session |
| `PUT` | `/api/jobs/[jobId]` | Update an existing job |
| `DELETE` | `/api/jobs/[jobId]` | Delete a job and all associated data |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs/[jobId]/applicants` | List all candidates for a job |
| `POST` | `/api/jobs/[jobId]/applicants` | Add candidate(s) manually (single or batch) |
| `POST` | `/api/jobs/[jobId]/upload` | Upload CSV, Excel, or PDF files for candidate ingestion |
| `GET` | `/api/candidates/[candidateId]` | Get candidate profile and latest screening result |
| `PATCH` | `/api/candidates/[candidateId]` | Update recruiter decision on a candidate |

### Screening
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/jobs/[jobId]/screen` | Trigger AI screening pipeline (async) |
| `GET` | `/api/jobs/[jobId]/results` | Fetch screening results (optional `?sessionId=`) |

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/PRIEST099/HireSense.git
cd HireSense

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your actual values (see Environment Variables below)

# 4. Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/hiresense`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |
| `CLAUDE_API_KEY` | No | Anthropic Claude API key (optional resilience fallback) |
| `AUTH_SECRET` | Yes | Secret key for NextAuth.js JWT signing (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Application base URL (`http://localhost:3000` for local, production URL for deployment) |

**Example `.env.local`:**

```env
MONGODB_URI=mongodb+srv://your-connection-string
GEMINI_API_KEY=your-gemini-api-key
CLAUDE_API_KEY=your-claude-api-key
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000
```

> **Security:** Never commit `.env.local` to version control. The `.gitignore` file already excludes it.

---

## Project Structure

```
HireSense/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Auth pages (login, register)
│   │   ├── api/                     # API routes
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── jobs/                # Job CRUD + screening + upload
│   │   │   └── candidates/          # Candidate detail + decisions
│   │   ├── candidates/              # Candidate detail page
│   │   ├── dashboard/               # Recruiter dashboard
│   │   ├── jobs/                    # Job pages (list, create, detail, applicants, results)
│   │   ├── layout.tsx               # Root layout with providers
│   │   └── page.tsx                 # Landing page
│   ├── components/                  # Reusable UI components
│   │   ├── layout/                  # AppLayout, Navbar, Sidebar
│   │   └── ui/                      # Button, Card, Input, Badge, Modal, ProgressBar, etc.
│   ├── lib/
│   │   ├── ai/                      # AI layer
│   │   │   ├── provider.ts          # Dual-provider strategy (Gemini primary)
│   │   │   ├── gemini.ts            # Gemini API client configuration
│   │   │   ├── claude.ts            # Claude fallback client
│   │   │   ├── prompts.ts           # Versioned prompt templates (v1.0.0)
│   │   │   ├── orchestrator.ts      # 3-stage screening pipeline
│   │   │   ├── scorer.ts            # Batch candidate scoring
│   │   │   └── rate-limiter.ts      # Token-bucket rate limiting
│   │   ├── db/
│   │   │   ├── connection.ts        # MongoDB connection management
│   │   │   └── models/              # Mongoose schemas (User, Job, Candidate, Session, Result)
│   │   ├── parsers/
│   │   │   ├── csv-parser.ts        # CSV parsing with 30+ column aliases
│   │   │   ├── excel-parser.ts      # Excel → CSV conversion + parsing
│   │   │   └── resume-parser.ts     # PDF text extraction + AI structuring
│   │   └── validators/              # Zod schemas for all API inputs
│   ├── store/                       # Redux Toolkit store
│   │   ├── store.ts                 # Store configuration
│   │   └── slices/                  # jobs, candidates, screening slices
│   └── middleware.ts                # Route protection (auth check)
├── .env.example                     # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

---

## Assumptions and Limitations

### Assumptions

1. **Gemini API availability** — The system assumes the Gemini API is accessible and within free-tier rate limits. A token-bucket rate limiter enforces 14 RPM for Flash and 2 RPM for Pro models to prevent quota exhaustion.
2. **PDF quality** — Resume PDFs are assumed to be text-based (not scanned images). There is no OCR capability; image-only PDFs will fail parsing and raw text will be stored as empty.
3. **Candidate data honesty** — The AI scores candidates based on the information provided. It does not verify claims such as employment history or certifications.
4. **Single-user sessions** — Each job is owned by a single recruiter. There is no multi-user collaboration or team-based access control on individual jobs.
5. **English language** — Prompts and scoring rubrics are designed for English-language job descriptions and candidate profiles.

### Limitations

1. **No OCR for scanned resumes** — Only text-extractable PDFs are supported. Scanned documents or image-based resumes will not parse correctly.
2. **File size limit** — Uploaded files (CSV, Excel, PDF) are limited to 5 MB each.
3. **Rate limiting on free tier** — With Gemini free tier, large candidate pools (50+ candidates) may take several minutes to process due to the 14 RPM Flash and 2 RPM Pro rate limits.
4. **No real-time updates** — Screening progress is polled every 3 seconds. There are no WebSocket or Server-Sent Event connections.
5. **No ATS integration** — The system operates standalone. There is no integration with third-party Applicant Tracking Systems.
6. **No email notifications** — Recruiters must check the application for screening completion. No email or push notifications are sent.
7. **No candidate deduplication** — If the same candidate is uploaded twice (e.g., via CSV and PDF), they will appear as separate entries.
8. **AI variability** — While prompts are versioned and temperature is set low (0.2–0.3), LLM outputs may vary slightly across identical inputs. The confidence score helps flag uncertain assessments.

---

## Deployment

The application is deployed and accessible at:

- **Frontend + API:** [Vercel](https://vercel.com) — [https://hire-sense-omega.vercel.app](https://hire-sense-omega.vercel.app)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

Environment variables are securely configured through the Vercel dashboard and are not exposed in the codebase.

---

## License

This project was built for the **Umurava AI Hackathon** — an innovation challenge to build AI products for the Human Resources industry.
