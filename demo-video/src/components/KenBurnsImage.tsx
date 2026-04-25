import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  src: string;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
}

/**
 * Adds a slow Ken Burns effect (zoom + pan) to a static screenshot.
 * Makes still images feel cinematic.
 */
export const KenBurnsImage: React.FC<Props> = ({
  src,
  zoomFrom = 1,
  zoomTo = 1.08,
  panX = 0,
  panY = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, durationInFrames], [0, panX]);
  const y = interpolate(frame, [0, durationInFrames], [0, panY]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        }}
      />
    </div>
  );
};
