import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { scenes, colors } from "./theme";
import { HookScene } from "./scenes/HookScene";
import { IntroScene } from "./scenes/IntroScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { IngestionScene } from "./scenes/IngestionScene";
import { ScreeningScene } from "./scenes/ScreeningScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { PipelineScene } from "./scenes/PipelineScene";
import { TechCredibilityScene } from "./scenes/TechCredibilityScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProgressBar } from "./components/ProgressBar";

export const HireSenseDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {/* Optional background music — drop a file at public/audio/bgm.mp3 */}
      {/* <Audio src={staticFile("audio/bgm.mp3")} volume={0.15} /> */}

      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene />
      </Sequence>

      <Sequence from={scenes.intro.start} durationInFrames={scenes.intro.duration}>
        <IntroScene />
      </Sequence>

      <Sequence from={scenes.dashboard.start} durationInFrames={scenes.dashboard.duration}>
        <DashboardScene />
      </Sequence>

      <Sequence from={scenes.ingestion.start} durationInFrames={scenes.ingestion.duration}>
        <IngestionScene />
      </Sequence>

      <Sequence from={scenes.screening.start} durationInFrames={scenes.screening.duration}>
        <ScreeningScene />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsScene />
      </Sequence>

      <Sequence from={scenes.comparison.start} durationInFrames={scenes.comparison.duration}>
        <ComparisonScene />
      </Sequence>

      <Sequence from={scenes.pipeline.start} durationInFrames={scenes.pipeline.duration}>
        <PipelineScene />
      </Sequence>

      <Sequence from={scenes.techCred.start} durationInFrames={scenes.techCred.duration}>
        <TechCredibilityScene />
      </Sequence>

      <Sequence from={scenes.outro.start} durationInFrames={scenes.outro.duration}>
        <OutroScene />
      </Sequence>

      {/* Persistent progress bar */}
      <ProgressBar />
    </AbsoluteFill>
  );
};
