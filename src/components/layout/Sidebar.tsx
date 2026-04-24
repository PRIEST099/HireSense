"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BrandFunnelIcon } from "@/components/paper/BrandFunnelIcon";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/jobs", icon: "◫", label: "Jobs", showCount: true },
  { href: "/jobs/new", icon: "+", label: "Create Job" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/jobs")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const items = Array.isArray(data)
          ? data
          : data.data || data.jobs || data.items || [];
        setJobCount(items.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/jobs/new") return pathname === "/jobs/new";
    if (href === "/jobs") return pathname === "/jobs" || (pathname.startsWith("/jobs/") && pathname !== "/jobs/new");
    return pathname === href;
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[70vw] sm:w-[210px] paper-sketch-divider-right transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          padding: "18px 10px",
        }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between mb-2 lg:hidden" style={{ padding: "0 8px" }}>
          <span style={{ fontSize: 16, color: "var(--paper-text-3)" }}>Menu</span>
          <button
            onClick={onClose}
            style={{
              padding: 4,
              borderRadius: 4,
              background: "transparent",
              border: "1.5px solid var(--paper-border)",
              cursor: "pointer",
            }}
          >
            <X className="h-4 w-4" style={{ color: "var(--paper-text-2)" }} />
          </button>
        </div>

        {/* Logo */}
        <Link href="/dashboard" onClick={onClose} style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28, padding: "0 8px" }}>
            <div
              className="torn-bg-dramatic"
              style={{
                width: 30,
                height: 30,
                borderRadius: 5,
                border: "2px solid var(--paper-text-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "2px 2px 0 var(--paper-text-1)",
                flexShrink: 0,
                ["--torn-color" as string]: "var(--paper-accent)",
              } as React.CSSProperties}
            >
              <BrandFunnelIcon size={22} />
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                letterSpacing: "-0.01em",
              }}
            >
              HireSense AI
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 5,
                  background: active ? "var(--paper-accent-soft)" : "transparent",
                  border: `1.5px solid ${active ? "var(--paper-border-acc)" : "transparent"}`,
                  color: active ? "var(--paper-accent)" : "var(--paper-text-3)",
                  fontSize: 17,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s, color 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {n.label}
                {n.showCount && jobCount !== null && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 17,
                      fontWeight: 700,
                      background: "var(--paper-accent-soft)",
                      color: "var(--paper-accent)",
                      padding: "1px 7px",
                      borderRadius: 3,
                      border: "1px solid var(--paper-border-acc)",
                    }}
                  >
                    {jobCount}
                  </span>
                )}
                {active && (
                  <svg
                    key={`underline-${n.href}`}
                    aria-hidden="true"
                    viewBox="0 0 140 6"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 12,
                      bottom: 2,
                      width: "calc(100% - 24px)",
                      height: 6,
                      pointerEvents: "none",
                      overflow: "visible",
                    }}
                  >
                    <path
                      d="M2 3 Q 20 1, 40 3 T 80 3 T 120 3 T 138 3"
                      fill="none"
                      stroke="var(--paper-accent)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeDasharray="160"
                      className="wb-draw-underline"
                      style={{ ["--underline-length" as string]: 160 } as React.CSSProperties}
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
