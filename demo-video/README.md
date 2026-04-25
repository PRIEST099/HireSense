# HireSense Demo Video — Built with Remotion

A fully programmatic 2-minute demo video for the HireSense AI hackathon submission. Built with **Remotion** (React for video) — every animation, transition, and visual element is code-driven.

## Why Remotion?

- **Reproducible** — every render is identical
- **Iterable** — change a number, get a new video in minutes
- **Version-controlled** — entire video pipeline lives in git alongside the product
- **No video editor required** — judges see we engineered the demo as carefully as the product

## Video Structure (120 seconds, 30fps, 1920×1080)

| Time | Scene | Purpose |
|---|---|---|
| 0:00 – 0:08 | **Hook** | Three-line problem statement with rising tension |
| 0:08 – 0:18 | **Intro** | Logo reveal + brand tagline |
| 0:18 – 0:28 | **Dashboard** | Animated stat cards counting up |
| 0:28 – 0:42 | **Ingestion** | Multi-source candidate inputs (profile, CSV, PDF, URL) |
| 0:42 – 0:52 | **3-Stage Pipeline** | Visual diagram of Parse → Score → Rank |
| 0:52 – 1:10 | **Results** | Top candidate with animated score breakdown + AI reasoning |
| 1:10 – 1:20 | **Comparison** | Top 3 candidates side-by-side with radar-style scoring |
| 1:20 – 1:35 | **Pipeline (Kanban)** | The unique decision-flow board |
| 1:35 – 1:48 | **Tech Credibility** | Stats + feature list (28 tests, Umurava schema, etc.) |
| 1:48 – 2:00 | **Outro** | Logo + URLs + closing line |

A persistent progress bar runs along the bottom of the entire video.

## Quick Start

```bash
cd demo-video
npm install
npm run dev      # Opens Remotion Studio in browser for live preview
npm run build    # Renders MP4 to ./out/HireSense-Demo.mp4
npm run build-hd # Higher quality render (CRF 18, larger file)
```

The studio (`npm run dev`) lets you scrub through the timeline and tweak any scene in real time.

## Adding Music (Optional but Recommended)

1. Download royalty-free background music from [Pixabay Music](https://pixabay.com/music/) — search "corporate uplifting" or "tech inspiring"
2. Save the file as `public/audio/bgm.mp3`
3. In `src/Composition.tsx`, uncomment the `<Audio>` line:
   ```tsx
   <Audio src={staticFile("audio/bgm.mp3")} volume={0.15} />
   ```
4. Re-render

## Adding Voiceover (Optional)

Same approach as music — drop a file at `public/audio/voiceover.mp3` and add an `<Audio>` tag with `volume={0.9}`.

The full voiceover script is in `VOICEOVER.md`.

## File Structure

```
demo-video/
├── src/
│   ├── index.ts              # Remotion entry
│   ├── Root.tsx              # Composition registration
│   ├── Composition.tsx       # Main video — sequences all scenes
│   ├── theme.ts              # Colors, fonts, scene timing
│   ├── scenes/
│   │   ├── HookScene.tsx
│   │   ├── IntroScene.tsx
│   │   ├── DashboardScene.tsx
│   │   ├── IngestionScene.tsx
│   │   ├── ScreeningScene.tsx
│   │   ├── ResultsScene.tsx
│   │   ├── ComparisonScene.tsx
│   │   ├── PipelineScene.tsx
│   │   ├── TechCredibilityScene.tsx
│   │   └── OutroScene.tsx
│   └── components/
│       ├── Caption.tsx
│       ├── LowerThird.tsx
│       ├── ProgressBar.tsx
│       ├── ScoreBar.tsx
│       └── KenBurnsImage.tsx
├── public/
│   ├── audio/                # Drop bgm.mp3 / voiceover.mp3 here
│   └── screenshots/          # Optional app screenshots
├── package.json
├── remotion.config.ts
├── tsconfig.json
└── README.md
```

## Customization Tips

- **Adjust scene timing:** edit `scenes` object in `src/theme.ts`
- **Change brand colors:** edit `colors` object in `src/theme.ts`
- **Replace candidate data:** edit the constants at the top of each scene file
- **Add real screenshots:** drop PNGs into `public/screenshots/` and import via `staticFile("screenshots/yourfile.png")`

## Render Output

Final video lands at: `out/HireSense-Demo.mp4`

Default render:
- Duration: 120 seconds
- Resolution: 1920×1080
- Frame rate: 30fps
- Codec: H.264
- File size: ~30–50 MB

## Upload Recommendation

1. Upload to **YouTube as Unlisted** for the best playback experience
2. Add the YouTube link to the main HireSense `README.md` at the top
3. Also push the rendered MP4 to this folder so judges browsing the repo can download it
