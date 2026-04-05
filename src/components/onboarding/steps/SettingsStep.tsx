import { useState, useCallback } from 'react';
import { Settings, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsStepProps {
  onNext: () => void;
}

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
];

export function SettingsStep({ onNext }: SettingsStepProps) {
  const { monthStartDay, setMonthStartDay, currency, setCurrency } =
    useSettingsStore();
  const [dayError, setDayError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleDayChange = useCallback(
    (value: string) => {
      const num = parseInt(value);
      if (value === '') {
        setMonthStartDay(1);
        setDayError('');
        return;
      }
      if (isNaN(num) || num < 1 || num > 28) {
        setDayError('Must be between 1 and 28');
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        return;
      }
      setDayError('');
      setMonthStartDay(num);
    },
    [setMonthStartDay]
  );

  const handleNext = () => {
    if (dayError) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Budget Tracker</h1>
        <p className="mt-2 text-muted-foreground">
          Let's configure your regional and app settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} - {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            All amounts will be displayed in your selected currency.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Cycle Start Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={shaking ? 'animate-shake' : ''}>
            <Label className="text-sm text-muted-foreground">
              Day of the month your budget cycle begins
            </Label>
            <div className={`mt-2 ${dayError ? 'field-error' : ''}`}>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={monthStartDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className="h-11 w-32 text-base tabular-nums"
              />
            </div>
            <div className="field-error-msg" data-visible={!!dayError}>
              <span className="pt-0.5 text-xs text-destructive">{dayError}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Budget periods run from day {monthStartDay} of each month to day{' '}
              {monthStartDay - 1 || 28} of the next.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
