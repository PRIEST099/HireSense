import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${sizes[size]} ${className}`}
      style={{ color: "var(--paper-accent)" }}
    />
  );
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size="lg" />
      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          color: "var(--paper-text-3)",
          fontFamily: "var(--font-caveat), 'Caveat', cursive",
        }}
      >
        {message}
      </p>
    </div>
  );
}
