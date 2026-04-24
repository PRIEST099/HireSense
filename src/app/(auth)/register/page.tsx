"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperInput } from "@/components/paper/PaperInput";
import { BrandFunnelIcon } from "@/components/paper/BrandFunnelIcon";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.error) {
        window.location.href = "/login";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 paper-grid"
      style={{ backgroundColor: "var(--paper-bg)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div
              className="torn-bg-dramatic"
              style={{
                width: 42,
                height: 42,
                borderRadius: 6,
                border: "2px solid var(--paper-text-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "2px 3px 0 var(--paper-text-1)",
                ["--torn-color" as string]: "var(--paper-accent)",
              } as React.CSSProperties}
            >
              <BrandFunnelIcon size={30} />
            </div>
            <span style={{ fontSize: 26, fontWeight: 700, color: "var(--paper-text-1)" }}>HireSense AI</span>
          </Link>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "var(--paper-text-1)",
              marginTop: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Create account
          </h1>
          <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 4 }}>
            Start screening candidates in minutes.
          </p>
        </div>

        <PaperCard padding="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                style={{
                  background: "var(--paper-red-soft)",
                  color: "var(--paper-red)",
                  fontSize: 17,
                  padding: "10px 14px",
                  borderRadius: 5,
                  border: "1.5px solid rgba(185,28,28,0.25)",
                }}
              >
                {error}
              </div>
            )}

            <PaperInput
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
            />

            <PaperInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              required
            />

            <PaperInput
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Corp"
              required
            />

            <PaperInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />

            <PaperButton type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </PaperButton>
          </form>

          <p
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 17,
              color: "var(--paper-text-3)",
            }}
          >
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--paper-accent)", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </PaperCard>
      </div>
    </div>
  );
}
