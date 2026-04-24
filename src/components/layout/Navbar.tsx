"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const company = (session?.user as Record<string, unknown> | undefined)?.company as string | undefined;
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header
      className="paper-sketch-divider-bottom"
      style={{
        height: 52,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden"
        style={{
          padding: 6,
          borderRadius: 4,
          background: "transparent",
          border: "1.5px solid var(--paper-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" style={{ color: "var(--paper-text-2)" }} />
      </button>

      <div style={{ flex: 1 }} />

      {session?.user && (
        <>
          <div style={{ textAlign: "right" }} className="hidden sm:block">
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                lineHeight: 1.1,
              }}
            >
              {userName}
            </div>
            {company && (
              <div style={{ fontSize: 17, color: "var(--paper-text-3)", lineHeight: 1.1, marginTop: 2 }}>{company}</div>
            )}
          </div>
          <div
            className="torn-bg-dramatic"
            style={{
              width: 32,
              height: 32,
              borderRadius: 5,
              border: "2px solid var(--paper-text-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "1px 2px 0 var(--paper-text-1)",
              fontFamily: "var(--font-caveat), 'Caveat', cursive",
              flexShrink: 0,
              ["--torn-color" as string]: "var(--paper-accent)",
            } as React.CSSProperties}
          >
            {initial}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            aria-label="Sign out"
            style={{
              padding: 6,
              borderRadius: 4,
              background: "var(--paper-card)",
              border: "1.5px solid var(--paper-border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--paper-shadow)",
            }}
          >
            <LogOut className="h-4 w-4" style={{ color: "var(--paper-text-2)" }} />
          </button>
        </>
      )}
    </header>
  );
}
