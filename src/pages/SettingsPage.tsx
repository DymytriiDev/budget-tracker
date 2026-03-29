import { useState, useCallback } from "react";
import { Cloud, CloudOff, LogOut, RefreshCw, Copy, Check } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useOwnerStore } from "@/stores/ownerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthToken, clearAuthToken, isLocalDev } from "@/lib/auth";
import { PageTransition } from "@/components/PageTransition";
import { pushRemoteState, loadRemoteState } from "@/lib/sync";

export function SettingsPage() {
  const { monthStartDay, setMonthStartDay, defaultOwnerId, setDefaultOwnerId, currency, setCurrency } = useSettingsStore();
  const { owners } = useOwnerStore();
  const token = getAuthToken();
  const local = isLocalDev();
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dayError, setDayError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleDayChange = useCallback((value: string) => {
    const num = parseInt(value);
    if (value === "") {
      setMonthStartDay(1);
      setDayError("");
      return;
    }
    if (isNaN(num) || num < 1 || num > 28) {
      setDayError("Must be between 1 and 28");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    setDayError("");
    setMonthStartDay(num);
  }, [setMonthStartDay]);

  const handleForceSync = async () => {
    setSyncing(true);
    await pushRemoteState();
    setSyncing(false);
  };

  const handleForcePull = async () => {
    setSyncing(true);
    await loadRemoteState();
    setSyncing(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.reload();
  };

  const handleCopyLink = () => {
    if (!token) return;
    const link = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold md:text-2xl">Settings</h1>
        <p className="mt-0.5 text-muted-foreground">
          Configure your budget tracker
        </p>
      </div>

      <div className="max-w-lg space-y-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Month Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 ${shaking ? "animate-shake" : ""}`}>
              <Label>Day of the month your budget cycle begins</Label>
              <div className={dayError ? "field-error" : ""}>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={monthStartDay}
                  onChange={(e) => handleDayChange(e.target.value)}
                  className="h-11 w-32 text-base tabular-nums"
                  aria-label="Month start day"
                />
              </div>
              <div className="field-error-msg" data-visible={!!dayError}>
                <span className="text-xs text-destructive pt-0.5">{dayError}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Budget periods run from day {monthStartDay} of each month to day{" "}
                {monthStartDay - 1 || 28} of the next.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Default Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={defaultOwnerId || "none"} onValueChange={(v) => setDefaultOwnerId(v === "none" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No default owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default owner</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When adding a new expense, the owner field will be pre-filled with your selected default owner.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All amounts in the app will be displayed in your selected currency.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cloud Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {local ? (
                <>
                  <CloudOff
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">
                    Local mode — sync disabled on localhost
                  </span>
                </>
              ) : token ? (
                <>
                  <Cloud className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-primary">
                    Connected — syncing to cloud
                  </span>
                </>
              ) : (
                <>
                  <CloudOff
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">Not connected</span>
                </>
              )}
            </div>

            {!local && token && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9"
                  onClick={handleForceSync}
                  disabled={syncing}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  Push to cloud
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9"
                  onClick={handleForcePull}
                  disabled={syncing}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  Pull from cloud
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy access link"}
                </Button>
              </div>
            )}

            {!local && token && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-9 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
}
