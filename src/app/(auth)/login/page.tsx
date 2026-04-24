"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperInput } from "@/components/paper/PaperInput";
import { BrandFunnelIcon } from "@/components/paper/BrandFunnelIcon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 paper-grid"
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
            Welcome back
          </h1>
          <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 4 }}>Sign in to continue screening.</p>
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />

            <PaperInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <PaperButton type="submit" loading={loading} className="w-full" size="lg">
              Sign in
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
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "var(--paper-accent)", fontWeight: 700, textDecoration: "none" }}
            >
              Sign up
            </Link>
          </p>
        </PaperCard>
      </div>
    </div>
  );
}
