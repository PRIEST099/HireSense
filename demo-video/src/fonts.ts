import { loadFont } from "@remotion/google-fonts/Caveat";

// Load the Caveat font used throughout the actual HireSense app.
// Available weights: 400, 500, 600, 700
const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
});

export const caveatFontFamily = fontFamily;
