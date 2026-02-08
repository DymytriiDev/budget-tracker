import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  getAuthToken,
  setAuthToken,
  extractTokenFromUrl,
  isLocalDev,
} from "@/lib/auth";
import {
  loadRemoteState,
  startSyncListeners,
  stopSyncListeners,
} from "@/lib/sync";
import { LoginPage } from "@/pages/LoginPage";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const bootstrap = useCallback(async () => {
    // On localhost, skip auth — use localStorage only
    if (isLocalDev()) {
      setStatus("authenticated");
      return;
    }

    // Check URL for ?token= magic link
    const urlToken = extractTokenFromUrl();
    if (urlToken) {
      setAuthToken(urlToken);
    }

    const token = getAuthToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    // Try to load remote state (validates token implicitly)
    const loaded = await loadRemoteState();
    if (loaded) {
      startSyncListeners();
      setStatus("authenticated");
      return;
    }

    // Remote state might be empty (first use) — validate token directly
    try {
      const res = await fetch("/api/sync", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setStatus("unauthenticated");
      } else {
        // Token valid, no remote data yet — start syncing local data
        startSyncListeners();
        setStatus("authenticated");
      }
    } catch {
      // API unreachable — allow offline access with local data
      setStatus("authenticated");
    }
  }, []);

  useEffect(() => {
    bootstrap();
    return () => stopSyncListeners();
  }, [bootstrap]);

  const handleAuthenticated = useCallback(async () => {
    setStatus("loading");
    await loadRemoteState();
    startSyncListeners();
    setStatus("authenticated");
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return <>{children}</>;
}
