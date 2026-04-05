import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Download,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAuthToken, setAuthToken, isLocalDev } from '@/lib/auth';
import { startSyncListeners } from '@/lib/sync';

interface CompleteStepProps {
  onBack: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function CompleteStep({ onBack }: CompleteStepProps) {
  const { completeOnboarding } = useOnboardingStore();
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    let existingToken = getAuthToken();

    if (!existingToken && !isLocalDev()) {
      existingToken = crypto.randomUUID();
      setAuthToken(existingToken);
    }

    setToken(existingToken);

    if (existingToken) {
      const link = `${window.location.origin}/?token=${existingToken}`;
      setShareLink(link);
    } else {
      setShareLink(window.location.origin);
    }

    setCanShare(typeof navigator.share === 'function');

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Budget Tracker',
          text: 'Access your budget tracker with this link',
          url: shareLink,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    if (!isLocalDev() && token) {
      startSyncListeners();
    }
  };

  const local = isLocalDev();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Sparkles className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">You're All Set!</h1>
        <p className="mt-2 text-muted-foreground">
          {local
            ? 'Your data is stored locally on this device.'
            : 'Save your access link to use on other devices.'}
        </p>
      </div>

      {!local && token && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="h-4 w-4 text-primary" />
                Your Access Link
              </div>
              <div className="rounded-lg bg-muted p-3">
                <code className="break-all text-xs">{shareLink}</code>
              </div>
              <p className="text-xs text-muted-foreground">
                This is your personal access link. Anyone with this link can
                access your budget data. Keep it safe!
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              {canShare && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(deferredPrompt || !isInstalled) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Install App</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isInstalled
                    ? 'App is already installed!'
                    : 'Install Budget Tracker for quick access and offline use.'}
                </p>
                {!isInstalled && deferredPrompt && (
                  <Button
                    onClick={handleInstall}
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Install Now
                  </Button>
                )}
                {!isInstalled && !deferredPrompt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use your browser's "Add to Home Screen" or "Install App"
                    option.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleComplete} className="gap-2" size="lg">
          Get Started
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
