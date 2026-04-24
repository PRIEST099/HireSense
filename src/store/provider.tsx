"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { DesignModeProvider } from "@/context/DesignModeContext";
import { DesignModeToggle } from "@/components/DesignModeToggle";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DesignModeProvider>
      <SessionProvider>
        <Provider store={store}>
          <ToastProvider>
            {children}
            <DesignModeToggle />
          </ToastProvider>
        </Provider>
      </SessionProvider>
    </DesignModeProvider>
  );
}
