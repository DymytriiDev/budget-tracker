import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  getAuthToken,
  setAuthToken,
  extractTokenFromUrl,
  isLocalDev,
} from "@/lib/auth";
import { loadRemoteState } from "@/lib/sync";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useOnboardingStore } from "@/stores/onboardingStore";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const { isCompleted: onboardingCompleted } = useOnboardingStore();

  // Determine if onboarding is needed:
  // - Only rely on the explicit completion flag
  // - This prevents skipping onboarding when categories are added mid-flow
  const needsOnboarding = !onboardingCompleted;

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
        setStatus("authenticated");
      }
    } catch {
      // API unreachable — allow offline access with local data
      setStatus("authenticated");
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleAuthenticated = useCallback(async () => {
    setStatus("loading");
    await loadRemoteState();
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

  // Show onboarding wizard for fresh installs
  if (needsOnboarding) {
    return <OnboardingWizard />;
  }

  return <>{children}</>;
}
