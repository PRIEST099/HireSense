"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ToastProvider>{children}</ToastProvider>
      </Provider>
    </SessionProvider>
  );
}
