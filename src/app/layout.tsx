import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/provider";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "HireSense AI - AI-Powered Talent Screening",
  description: "Screen, score, and shortlist candidates with AI while keeping humans in control of hiring decisions.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${caveat.variable}`}>
      <body className="h-full paper-bg paper-grid">
        {/* Hidden SVG filter defs for scratched-pen borders */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
        >
          <defs>
            {/* Three different seeds + frequencies = three different pen passes */}
            <filter id="paper-sketch-a" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="7" />
            </filter>
            <filter id="paper-sketch-b" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="13" />
              <feDisplacementMap in="SourceGraphic" scale="6" />
            </filter>
            <filter id="paper-sketch-c" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="28" />
              <feDisplacementMap in="SourceGraphic" scale="8" />
            </filter>
            <filter id="paper-sketch" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="7" />
            </filter>
            {/* Hand-drawn icon filter — subtle enough to preserve detail at small sizes */}
            <filter id="paper-sketch-icon" x="-8%" y="-8%" width="116%" height="116%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" />
              <feDisplacementMap in="SourceGraphic" scale="1.3" />
            </filter>
            {/* Subtle torn-paper edges (small notches) — for badges, toasts, chips */}
            <filter id="torn-subtle" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="19" />
              <feDisplacementMap in="SourceGraphic" scale="2.8" />
            </filter>
            {/* Dramatic torn-paper edges (ripped look) — for buttons and icon boxes */}
            <filter id="torn-dramatic" x="-14%" y="-14%" width="128%" height="128%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="27" />
              <feDisplacementMap in="SourceGraphic" scale="5" />
            </filter>
            {/* Hand-drawn funnel walls — gentle enough to keep the cone shape readable */}
            <filter id="funnel-sketch" x="-6%" y="-6%" width="112%" height="112%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="17" />
              <feDisplacementMap in="SourceGraphic" scale="2.5" />
            </filter>
          </defs>
        </svg>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
