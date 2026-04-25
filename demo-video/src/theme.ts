// HireSense paper-sketch theme — matches the actual app design system
// Source: src/app/globals.css

export const colors = {
  // Backgrounds (cream paper aesthetic)
  paperBg: "#F7F8FD",
  paperCard: "#FFFFFF",
  paperBgSoft: "#FAFBFE",

  // Borders
  paperBorder: "rgba(80, 110, 200, 0.18)",
  paperBorderAcc: "rgba(80, 110, 200, 0.45)",
  paperInk: "rgba(23, 24, 38, 0.85)",
  paperInkAcc: "rgba(79, 70, 229, 0.9)",

  // Text
  paperText1: "#171826",
  paperText2: "#3A3D56",
  paperText3: "#6B6F8A",
  paperText4: "#9EA2BB",

  // Brand accent (indigo)
  paperAccent: "#4F46E5",
  paperAccentSoft: "rgba(79, 70, 229, 0.1)",
  paperAccentBright: "#6366F1",

  // Status colors
  paperGreen: "#0D9488",
  paperGreenSoft: "rgba(13, 148, 136, 0.1)",
  paperAmber: "#B45309",
  paperAmberSoft: "rgba(180, 83, 9, 0.1)",
  paperRed: "#B91C1C",
  paperRedSoft: "rgba(185, 28, 28, 0.1)",

  // Stat card colors
  statBlue: "#4F46E5",
  statTeal: "#0D9488",
  statPurple: "#7C3AED",
  statAmber: "#B45309",

  // Radar
  radarGrid: "rgba(80, 110, 200, 0.14)",

  // Hook scene (dramatic dark intro only)
  darkBg: "#0A0E1A",
  darkAccent: "#6366F1",
};

export const shadows = {
  paper: "1px 2px 0 rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)",
  paperCard: "2px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 14px rgba(0, 0, 0, 0.06)",
  hard: "2px 3px 0 #171826",
  hardSm: "1px 2px 0 #171826",
};

// Font family is set once Caveat is loaded — see src/fonts.ts
import { caveatFontFamily } from "./fonts";

export const fonts = {
  // Caveat is the brand font — handwritten cursive at 600-700 weight
  caveat: caveatFontFamily,
  body: caveatFontFamily,
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
