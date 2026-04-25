// HireSense brand theme — used throughout the demo video

export const colors = {
  // Backgrounds
  bg: "#0A0E1A",            // Deep navy
  bgElevated: "#141B2D",    // Card backgrounds
  bgPaper: "#FAF7F2",       // Paper-sketch cream

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#A0AEC0",
  textInk: "#1A1A1A",       // Paper-sketch ink

  // Brand accent
  accent: "#3B82F6",        // Blue
  accentBright: "#60A5FA",
  accentDark: "#1E40AF",

  // Score colors
  scoreHigh: "#10B981",     // Green 80+
  scoreMid: "#F59E0B",      // Amber 60-79
  scoreLow: "#EF4444",      // Red <60

  // Recommendation colors
  strongMatch: "#10B981",
  goodMatch: "#3B82F6",
  partialMatch: "#F59E0B",
  weakMatch: "#94A3B8",

  // UI
  border: "#2D3748",
  shadow: "rgba(0, 0, 0, 0.5)",
};

export const fonts = {
  display: "Inter",
  body: "Inter",
  mono: "JetBrains Mono",
};

export const timing = {
  fps: 30,
  totalDurationFrames: 3600, // 120 seconds
};

// Scene durations in frames (30fps)
export const scenes = {
  hook: { start: 0, duration: 240 },             // 0:00 - 0:08
  intro: { start: 240, duration: 300 },          // 0:08 - 0:18
  dashboard: { start: 540, duration: 300 },      // 0:18 - 0:28
  ingestion: { start: 840, duration: 420 },      // 0:28 - 0:42
  screening: { start: 1260, duration: 300 },     // 0:42 - 0:52
  results: { start: 1560, duration: 540 },       // 0:52 - 1:10
  comparison: { start: 2100, duration: 300 },    // 1:10 - 1:20
  pipeline: { start: 2400, duration: 450 },      // 1:20 - 1:35
  techCred: { start: 2850, duration: 390 },      // 1:35 - 1:48
  outro: { start: 3240, duration: 360 },         // 1:48 - 2:00
};
