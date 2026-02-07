import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getIcon } from "@/lib/icons";

export function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = format(currentDate, "yyyy-MM");
  const { categories } = useCategoryStore();
  const { budgets, setBudget } = useBudgetStore();
  const { expenses } = useExpenseStore();
  const [localLimits, setLocalLimits] = useState<Record<string, string>>({});

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === month),
    [budgets, month],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month],
  );

  const getSpentForCategory = (categoryId: string) =>
    monthExpenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);

  const getLimitForCategory = (categoryId: string) => {
    if (localLimits[categoryId] !== undefined) return localLimits[categoryId];
    const budget = monthBudgets.find((b) => b.categoryId === categoryId);
    return budget ? String(budget.limit) : "";
  };

  const handleSave = (categoryId: string) => {
    const val = parseFloat(getLimitForCategory(categoryId));
    if (!isNaN(val) && val > 0) {
      setBudget(categoryId, month, val);
      setLocalLimits((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
    }
  };

  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-1 text-muted-foreground">
            Set monthly spending limits per category
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                ${totalBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalSpent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? "text-primary" : "text-destructive"}`}
              >
                ${(totalBudget - totalSpent).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-3">
        {categories.map((cat, i) => {
          const Icon = getIcon(cat.icon);
          const spent = getSpentForCategory(cat.id);
          const limitStr = getLimitForCategory(cat.id);
          const limit = parseFloat(limitStr) || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = spent > limit && limit > 0;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${spent.toFixed(2)}{" "}
                        {limit > 0 && `/ $${limit.toFixed(2)}`}
                      </p>
                    </div>
                    {limit > 0 && (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: isOver ? "#ef4444" : cat.color,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Limit"
                      className="w-28"
                      value={getLimitForCategory(cat.id)}
                      onChange={(e) =>
                        setLocalLimits((prev) => ({
                          ...prev,
                          [cat.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleSave(cat.id)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleSave(cat.id)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
