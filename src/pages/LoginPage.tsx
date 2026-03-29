import { useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { setAuthToken, validateToken } from "@/lib/auth";

interface LoginPageProps {
  onAuthenticated: () => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Extract token from full URL or plain token
    let token = input.trim();
    try {
      const url = new URL(token);
      const param = url.searchParams.get("token");
      if (param) token = param;
    } catch {
      // Not a URL — treat as raw token
    }

    if (!token) {
      setError("Please enter an access code or link.");
      setLoading(false);
      return;
    }

    const valid = await validateToken(token);
    if (valid) {
      setAuthToken(token);
      onAuthenticated();
    } else {
      setError("Invalid access code. Check your link and try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader className="items-center text-center">
          <div
            className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary"
            aria-hidden="true"
          >
            <DollarSign className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Budget</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your access code to continue
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Sign in"
          >
            <div className="space-y-2">
              <Label>Access code or link</Label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your access link or code"
                className="h-11 text-base"
                autoFocus
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
