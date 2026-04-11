# HireSense AI - Prompt Engineering Documentation

## Overview

HireSense AI uses a **3-stage AI pipeline** to screen candidates. Each stage has a purpose-built prompt with specific design decisions for accuracy, fairness, and explainability. All prompts enforce structured JSON output and include anti-hallucination safeguards.

**Prompt Version:** `1.0.0`

---

## Stage 1: Resume Parsing (PDF Uploads Only)

**Model:** Gemini 2.0 Flash (fast, high RPM) with Claude Haiku fallback
**Temperature:** 0.3 (low creativity, high accuracy for data extraction)
**Purpose:** Extract structured candidate data from raw PDF resume text.

### Design Decisions

- **Job context is included** so the AI knows which skills to prioritize during extraction, improving relevance of skill-level assessments
- **JSON response mode** (`responseMimeType: "application/json"`) ensures reliable structured output
- **Explicit schema** provided in the prompt prevents missing fields
- **Anti-hallucination rule:** "Do NOT guess or fabricate information -- only extract what is explicitly stated"
- Skill levels are inferred from context (5+ years = advanced/expert) rather than relying on self-reported labels

### Example Prompt Structure

```
You are an expert resume parser. Extract structured information from the resume text below.

JOB CONTEXT: [job title, company, required skills]
RESUME TEXT: [raw extracted PDF text]

Extract as JSON: name, email, phone, location, summary, skills (with levels),
experience (with achievements), education, certifications, languages, totalYearsExperience

Rules:
- Only extract explicitly stated information
- Infer skill levels from context (senior + 5yr = expert)
- Calculate totalYearsExperience from entries
```

### Output Schema

```json
{
  "name": "string",
  "email": "string",
  "skills": [{"name": "TypeScript", "level": "expert", "yearsOfExperience": 5}],
  "experience": [{"title": "...", "company": "...", "achievements": ["..."]}],
  "education": [{"degree": "...", "institution": "...", "graduationYear": 2020}],
  "totalYearsExperience": 7
}
```

---

## Stage 2: Individual Candidate Scoring

**Model:** Gemini 2.0 Flash with Claude Haiku fallback
**Temperature:** 0.3
**Purpose:** Score each candidate against job requirements on 4 dimensions.

### Design Decisions

- **Explicit scoring rubric** prevents inconsistent scoring:
  - 90-100: Exceeds all requirements significantly
  - 70-89: Meets most requirements well
  - 50-69: Meets some requirements
  - 30-49: Meets few requirements
  - 0-29: Does not meet requirements

- **Anti-hallucination instruction** (critical): "Only reference information EXPLICITLY present in the candidate profile. If information is missing, note it as a gap rather than assuming."

- **Four scoring dimensions** with recruiter-configurable weights:
  - Skills Match (default 40%)
  - Experience Match (default 30%)
  - Education Match (default 20%)
  - Culture Fit Match (default 10%)

- **Confidence score** (0-100) makes the AI self-assess how certain it is about the evaluation. Low confidence flags candidates who need human review.

- **Capped strengths/gaps** (max 3 each in prompt, enforced by Zod schema) keeps output concise and recruiter-friendly

- **Parallel processing** with `Promise.allSettled()` at concurrency of 3 -- one candidate failure doesn't block others

### Example Prompt Structure

```
You are an expert HR screening AI. Evaluate this candidate against the job requirements.

JOB REQUIREMENTS: [skills, experience range, education, certifications]
JOB PREFERENCES: [nice-to-haves, weighted lower]
SCREENING WEIGHTS: [skills 40%, experience 30%, education 20%, culture 10%]
CANDIDATE PROFILE: [structured profile data]

SCORING RUBRIC: [90-100 exceeds, 70-89 meets most, ...]

CRITICAL: Only reference EXPLICITLY present information.
If information is missing, note it as a gap.

Return JSON: overallScore, breakdown (4 dimensions), strengths[3], gaps[3],
recommendation, reasoning (2-3 sentences), confidenceScore
```

### Output Schema

```json
{
  "overallScore": 85,
  "breakdown": {
    "skillsMatch": 92,
    "experienceMatch": 80,
    "educationMatch": 75,
    "cultureFitMatch": 88
  },
  "strengths": ["Expert TypeScript with 5 years", "Team leadership experience", "AWS certified"],
  "gaps": ["No GraphQL experience listed", "Below minimum PostgreSQL years"],
  "recommendation": "good_match",
  "reasoning": "Strong full-stack profile matching 7 of 9 required skills...",
  "confidenceScore": 82
}
```

---

## Stage 3: Comparative Ranking

**Model:** Gemini 2.5 Pro (better reasoning) with Claude Sonnet fallback
**Temperature:** 0.2 (very consistent for comparison tasks)
**Purpose:** Review all individual scores, validate consistency, and produce final ranked list.

### Design Decisions

- **Uses the smarter model** (Pro/Sonnet) because comparative reasoning across multiple candidates requires deeper analysis than individual scoring
- **Score adjustments capped at +/-5 points** to preserve individual assessment integrity while fixing relative inconsistencies
- **All candidates ranked**, not just the shortlist -- lets recruiters see the full picture
- **Adjustment reasons documented** for transparency

### Example Prompt Structure

```
You are an expert HR ranking AI. Review individual assessments and produce a final ranking.

JOB CONTEXT: [title, company, key skills, experience range]
CANDIDATE SUMMARIES: [id, name, score, strengths, gaps for each]
SHORTLIST SIZE: Top 10

Tasks:
1. Review individual scores for consistency
2. Compare candidates RELATIVE to each other
3. Adjust scores if needed (max +/-5 points)
4. Return final ranked list

Return JSON: rankings [{candidateId, adjustedScore, rank, adjustmentReason}]
```

---

## Rate Limiting & Retry Strategy

- **Token bucket rate limiter**: Flash 14 RPM, Pro 2 RPM
- **Exponential backoff retry**: up to 2 retries with 1s, 2s, 4s delays
- **Graceful degradation**: if Gemini quota is exhausted, automatically falls back to Claude API
- **Zod validation** on every AI response -- malformed JSON triggers a retry with the error appended to the prompt

## Responsible AI Safeguards

1. **Anti-hallucination prompts** in every stage
2. **Confidence scores** flag uncertain assessments
3. **Human-in-the-loop** -- AI recommends, recruiter decides (shortlist/interview/reject)
4. **Full transparency** -- every score includes breakdown, strengths, gaps, and reasoning
5. **No PII in logs** -- AI responses are logged by length only, not content
