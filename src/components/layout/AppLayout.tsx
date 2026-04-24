"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex overflow-x-hidden paper-grid"
      style={{ backgroundColor: "var(--paper-bg)" }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 min-h-[calc(100vh-52px)]" style={{ padding: "20px 16px" }}>
          <div className="mx-auto w-full" style={{ maxWidth: 1280 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
