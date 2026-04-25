# HireSense Demo Voiceover Script

Total target: ~110 seconds of speech across 120 seconds of video (allow breathing room).

Recording tip: Speak slightly slower than feels natural, then **speed up to 1.05x in editing** for energy.

---

## 0:00 – 0:08 (Hook)

> "Recruiters drown in applications. The best candidates get lost in the noise."

*[Pause 1 sec]*

---

## 0:08 – 0:18 (Intro)

> "HireSense AI screens every applicant in minutes — built on Gemini, designed for Umurava's ecosystem, and ready to ship today."

---

## 0:18 – 0:28 (Dashboard)

> "Recruiters land on a clean dashboard. Every job, every candidate, every screening at a glance."

---

## 0:28 – 0:42 (Ingestion)

> "Add candidates from anywhere. Umurava profiles. CSV imports. PDF resumes. Resume URLs. Same pipeline. Same quality."

---

## 0:42 – 0:52 (3-Stage Pipeline)

> "Three stages, all powered by Gemini. Parse the resume. Score across four dimensions. Rank against the entire cohort."

---

## 0:52 – 1:10 (Results)

> "Every candidate scored zero to one hundred. Every score broken down. Every decision explained in plain English — strengths, gaps, confidence. The AI shows its work. The recruiter stays in control."

---

## 1:10 – 1:20 (Comparison)

> "Compare top candidates side-by-side. Trade-offs become instantly clear."

---

## 1:20 – 1:35 (Pipeline / Kanban)

> "Move candidates through the hiring funnel — shortlist, interview, decision — all in one board. No spreadsheets. No SMS chains. No lost applications."

---

## 1:35 – 1:48 (Tech Credibility)

> "Built right. TypeScript. Twenty-eight tests passing. SSRF-protected uploads. Prompt engineering documented. Umurava's Talent Profile Schema integrated. Production-grade from day one."

---

## 1:48 – 2:00 (Outro)

*[Slower, deliberate]*

> "HireSense isn't a hackathon prototype. It's the screening tool Umurava recruiters will use tomorrow."

*[Beat]*

> "Live now at hire-sense-omega.vercel.app."

---

## Recording Workflow

1. Record each section as a separate take in a quiet room
2. Use **Audacity** (free) to clean up: noise removal → normalize → mild compression
3. Export each as a numbered MP3 (`01-hook.mp3`, `02-intro.mp3`, etc.)
4. In Remotion: place each one at the matching scene's start frame using `<Audio src={staticFile("audio/01-hook.mp3")} startFrom={0} />` inside a `<Sequence>`

## ElevenLabs Alternative

If you don't want to record yourself:
1. Sign up free at elevenlabs.io
2. Use voice **"Adam"** (confident male) or **"Rachel"** (confident female)
3. Settings: Stability 50%, Clarity 75%
4. Paste each section, generate, download as MP3
