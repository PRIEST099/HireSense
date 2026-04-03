"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  dismissible?: boolean;
}

export function ErrorBanner({ message, onRetry, dismissible = true }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert">
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button onClick={onRetry} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors" title="Retry">
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100 transition-colors" title="Dismiss">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
