import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsPage() {
  const { monthStartDay, setMonthStartDay } = useSettingsStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure your budget tracker</p>
      </div>

      <div className="max-w-lg space-y-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Month Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Day of the month your budget cycle begins</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={monthStartDay}
                onChange={(e) => setMonthStartDay(parseInt(e.target.value) || 1)}
                className="h-11 w-32 text-base"
              />
              <p className="text-xs text-muted-foreground">
                Budget periods run from day {monthStartDay} of each month to day {monthStartDay - 1 || 28} of the next.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
