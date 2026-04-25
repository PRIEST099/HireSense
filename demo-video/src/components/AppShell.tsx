import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { BrandFunnelIcon } from "./BrandFunnelIcon";

interface Props {
  children: React.ReactNode;
  activePath?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Jobs", path: "/jobs" },
  { label: "New Job", path: "/jobs/new" },
];

/**
 * Replicates the AppLayout (Sidebar + Navbar) shell from the actual app.
 * Sidebar on the left with logo + nav items.
 * Top navbar with breadcrumb area.
 */
export const AppShell: React.FC<Props> = ({ children, activePath = "/dashboard" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shellEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 90 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        opacity: shellEnter,
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: colors.paperCard,
          borderRight: `1.5px solid ${colors.paperInk}`,
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: "2px 0 0 rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            paddingBottom: 16,
            borderBottom: `1.5px solid ${colors.paperBorder}`,
          }}
        >
          <BrandFunnelIcon size={32} color={colors.paperAccent} />
          <span
            style={{
              fontFamily: fonts.caveat,
              fontSize: 26,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -0.5,
            }}
          >
            HireSense
          </span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.path === activePath;
          return (
            <div
              key={item.path}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                background: isActive ? colors.paperAccentSoft : "transparent",
                color: isActive ? colors.paperAccent : colors.paperText2,
                fontFamily: fonts.caveat,
                fontSize: 19,
                fontWeight: isActive ? 700 : 600,
                border: isActive ? `1.5px solid ${colors.paperBorderAcc}` : "1.5px solid transparent",
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top navbar */}
        <div
          style={{
            height: 64,
            background: colors.paperCard,
            borderBottom: `1.5px solid ${colors.paperInk}`,
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: fonts.caveat,
              fontSize: 18,
              color: colors.paperText3,
            }}
          >
            hire-sense-omega.vercel.app{activePath}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: colors.paperAccent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.caveat,
                fontWeight: 700,
                fontSize: 16,
                border: `1.5px solid ${colors.paperInk}`,
              }}
            >
              GM
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "32px 40px", overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};
