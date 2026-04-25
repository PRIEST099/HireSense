import { Composition } from "remotion";
import { HireSenseDemo } from "./Composition";
import { timing } from "./theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="HireSenseDemo"
        component={HireSenseDemo}
        durationInFrames={timing.totalDurationFrames}
        fps={timing.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
