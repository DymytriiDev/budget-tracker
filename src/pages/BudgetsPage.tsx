import { useState, useMemo, useCallback } from "react";
import { Save, Users } from "lucide-react";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useOwnerStore } from "@/stores/ownerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getIcon } from "@/lib/icons";
import { formatCurrency, normalizeCurrencyInput } from "@/lib/currency";
import { getBudgetCycleMonth, isExpenseInCycle } from "@/lib/budgetCycle";
import { MonthNavigation } from "@/components/MonthNavigation";
import { PageTransition } from "@/components/PageTransition";

export function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { monthStartDay } = useSettingsStore();
  const month = getBudgetCycleMonth(currentDate, monthStartDay);
  const { categories } = useCategoryStore();
  const { budgets, setBudget } = useBudgetStore();
  const { expenses } = useExpenseStore();
  const { owners } = useOwnerStore();
  const [localLimits, setLocalLimits] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [ownerSplits, setOwnerSplits] = useState<Record<string, string>>({});
  const [restAmount, setRestAmount] = useState("");

  const clearFieldError = useCallback((id: string) => {
    setFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleLimitChange = (catId: string, value: string) => {
    const formatted = normalizeCurrencyInput(value);
    if (formatted === null) return;
    setLocalLimits((prev) => ({ ...prev, [catId]: formatted }));
    clearFieldError(catId);
  };

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === month),
    [budgets, month],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isExpenseInCycle(e.date, month, monthStartDay)),
    [expenses, month, monthStartDay],
  );

  const getSpentForCategory = (categoryId: string) =>
    monthExpenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);

  const getSavedLimit = (categoryId: string) => {
    const budget = monthBudgets.find((b) => b.categoryId === categoryId);
    return budget ? String(budget.limit) : "";
  };

  const getLimitForCategory = (categoryId: string) => {
    if (localLimits[categoryId] !== undefined) return localLimits[categoryId];
    return getSavedLimit(categoryId);
  };

  const isChanged = (categoryId: string) => {
    if (localLimits[categoryId] === undefined) return false;
    return localLimits[categoryId] !== getSavedLimit(categoryId);
  };

  const handleSave = (categoryId: string) => {
    const raw = getLimitForCategory(categoryId);
    if (!raw.trim()) {
      setBudget(categoryId, month, 0);
      setLocalLimits((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
      clearFieldError(categoryId);
      return;
    }
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) {
      setFieldErrors((prev) => ({ ...prev, [categoryId]: "Enter a valid amount" }));
      setShakingField(categoryId);
      setTimeout(() => setShakingField(null), 400);
      return;
    }
    setBudget(categoryId, month, val);
    setLocalLimits((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    clearFieldError(categoryId);
  };

  const openSplitDialog = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    const budget = monthBudgets.find((b) => b.categoryId === categoryId);
    if (budget?.ownerSplits) {
      const splits: Record<string, string> = {};
      budget.ownerSplits.forEach((split) => {
        splits[split.ownerId] = String(split.limit);
      });
      setOwnerSplits(splits);
      const totalSplits = budget.ownerSplits.reduce((sum, s) => sum + s.limit, 0);
      setRestAmount(String(budget.limit - totalSplits));
    } else {
      setOwnerSplits({});
      setRestAmount(String(budget?.limit || 0));
    }
    setSplitDialogOpen(true);
  };

  const handleSaveSplit = () => {
    if (!editingCategoryId) return;
    const splits: { ownerId: string; limit: number }[] = [];
    let totalSplits = 0;
    Object.entries(ownerSplits).forEach(([ownerId, amount]) => {
      const val = parseFloat(amount);
      if (!isNaN(val) && val > 0) {
        splits.push({ ownerId, limit: val });
        totalSplits += val;
      }
    });
    const rest = parseFloat(restAmount) || 0;
    const totalLimit = totalSplits + rest;
    if (totalLimit <= 0) return;
    setBudget(editingCategoryId, month, totalLimit, undefined, splits.length > 0 ? splits : undefined);
    setLocalLimits((prev) => {
      const next = { ...prev };
      delete next[editingCategoryId];
      return next;
    });
    setSplitDialogOpen(false);
  };

  const handleOwnerSplitChange = (ownerId: string, value: string) => {
    const formatted = normalizeCurrencyInput(value);
    if (formatted === null) return;
    setOwnerSplits((prev) => ({ ...prev, [ownerId]: formatted }));
  };

  const handleRestChange = (value: string) => {
    const formatted = normalizeCurrencyInput(value);
    if (formatted === null) return;
    setRestAmount(formatted);
  };

  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PageTransition>
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Budgets</h1>
          <p className="mt-0.5 text-muted-foreground">
            Set monthly spending limits per category
          </p>
        </div>
        <MonthNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
         <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(totalBudget)}
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
         <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
            </CardContent>
          </Card>
        </div>
        <div>
         <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold ${totalBudget - totalSpent >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {formatCurrency(Math.abs(totalBudget - totalSpent))}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          const spent = getSpentForCategory(cat.id);
          const limitStr = getLimitForCategory(cat.id);
          const limit = parseFloat(limitStr) || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = spent > limit && limit > 0;
          const changed = isChanged(cat.id);

          return (
            <div key={cat.id}>
              <Card className="border-border/50">
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: cat.color + "20" }}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <p className="text-xs font-medium flex-1">{cat.name}</p>
                    {/* Desktop inline input */}
                    <div className={`hidden items-center gap-2 sm:flex ${shakingField === cat.id ? "animate-shake" : ""}`}>
                      <div className={fieldErrors[cat.id] ? "field-error" : ""}>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            placeholder="0.00"
                            className="w-28 h-10 text-base pl-7 tabular-nums max-w-[90px]"
                            value={getLimitForCategory(cat.id)}
                            onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSave(cat.id)
                            }
                            aria-label={`Budget limit for ${cat.name}`}
                          />
                        </div>
                      </div>
                      {owners.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => openSplitDialog(cat.id)}
                          aria-label={`Split budget by owners for ${cat.name}`}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {changed && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleSave(cat.id)}
                          aria-label={`Save budget for ${cat.name}`}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    {limit > 0 && (
                      <div
                        className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${cat.name} budget usage`}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: isOver ? "#ef4444" : cat.color,
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(spent)}{" "}
                      {limit > 0 && `/ ${formatCurrency(limit)}`}
                    </p>
                  </div>
                  {/* Mobile stacked input */}
                  <div className={`mt-2 sm:hidden ${shakingField === cat.id ? "animate-shake" : ""}`}>
                    <div className={`flex items-center gap-2 ${fieldErrors[cat.id] ? "field-error" : ""}`}>
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          placeholder="0.00"
                          className="flex-1 h-10 text-base pl-7 tabular-nums"
                          value={getLimitForCategory(cat.id)}
                          onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSave(cat.id)}
                          aria-label={`Budget limit for ${cat.name}`}
                        />
                      </div>
                      {owners.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => openSplitDialog(cat.id)}
                          aria-label={`Split budget by owners for ${cat.name}`}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {changed && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleSave(cat.id)}
                          aria-label={`Save budget for ${cat.name}`}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="field-error-msg" data-visible={!!fieldErrors[cat.id]}>
                      <span className="text-xs text-destructive pt-0.5">{fieldErrors[cat.id]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Split Budget by Owners</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {owners.map((owner) => (
              <div key={owner.id} className="space-y-2">
                <Label>{owner.name}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">€</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    placeholder="0.00"
                    className="h-11 text-base pl-8 tabular-nums"
                    value={ownerSplits[owner.id] || ""}
                    onChange={(e) => handleOwnerSplitChange(owner.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label>Rest (unassigned)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">€</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.00"
                  className="h-11 text-base pl-8 tabular-nums"
                  value={restAmount}
                  onChange={(e) => handleRestChange(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(
                  Object.values(ownerSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) +
                  (parseFloat(restAmount) || 0)
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSplitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSplit}>Save Split</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
}
