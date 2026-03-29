import { useState, useMemo, type ReactNode } from "react";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertTriangle,
  Maximize2,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/currency";
import { getBudgetCycleMonth, getLast6BudgetCycles, isExpenseInCycle } from "@/lib/budgetCycle";
import { MonthNavigation } from "@/components/MonthNavigation";
import { PageTransition } from "@/components/PageTransition";


export function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const { monthStartDay } = useSettingsStore();
  const month = getBudgetCycleMonth(currentDate, monthStartDay);
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const { expenses } = useExpenseStore();

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === month),
    [budgets, month],
  );
  const monthExpenses = useMemo(
    () => expenses.filter((e) => isExpenseInCycle(e.date, month, monthStartDay)),
    [expenses, month, monthStartDay],
  );

  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const budgetUsedPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const barData = useMemo(() => {
    return categories
      .map((cat) => {
        const budget = monthBudgets.find((b) => b.categoryId === cat.id);
        if (!budget) return null;
        const spent = monthExpenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((s, e) => s + e.amount, 0);
        return {
          name: cat.name.length > 12 ? cat.name.slice(0, 12) + "…" : cat.name,
          budget: budget.limit,
          spent,
          color: cat.color,
        };
      })
      .filter(Boolean);
  }, [categories, monthBudgets, monthExpenses]);

  const pieData = useMemo(() => {
    return categories
      .map((cat) => {
        const spent = monthExpenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((s, e) => s + e.amount, 0);
        if (spent === 0) return null;
        return { name: cat.name, value: spent, color: cat.color };
      })
      .filter(Boolean) as { name: string; value: number; color: string }[];
  }, [categories, monthExpenses]);

  const trendData = useMemo(() => {
    const cycles = getLast6BudgetCycles(currentDate, monthStartDay);
    return cycles.map((cycleMonth) => {
      const spent = expenses
        .filter((e) => isExpenseInCycle(e.date, cycleMonth, monthStartDay))
        .reduce((s, e) => s + e.amount, 0);
      const budgetTotal = budgets
        .filter((b) => b.month === cycleMonth)
        .reduce((s, b) => s + b.limit, 0);
      const [year, month] = cycleMonth.split('-').map(Number);
      const label = formatDate(new Date(year, month - 1, 1), "MMM");
      return { name: label, spent, budget: budgetTotal };
    });
  }, [currentDate, expenses, budgets, monthStartDay]);

  const topCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const spent = monthExpenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((s, e) => s + e.amount, 0);
        const budget = monthBudgets.find((b) => b.categoryId === cat.id);
        return { ...cat, spent, limit: budget?.limit || 0 };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [categories, monthExpenses, monthBudgets]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
          <p className="mb-1 text-sm font-medium">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={barData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#2a2d3a" }}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#2a2d3a" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {(barData as { name: string; budget: number; spent: number; color: string }[]).map((entry, index) => (
          <Bar
            key={`budget-${index}`}
            dataKey="budget"
            name="Budget"
            fill={entry.color}
            radius={[4, 4, 0, 0]}
            opacity={0.6}
            hide={index > 0}
          />
        ))}
        {(barData as { name: string; budget: number; spent: number; color: string }[]).map((entry, index) => (
          <Bar
            key={`spent-${index}`}
            dataKey="spent"
            name="Spent"
            fill={entry.color}
            radius={[4, 4, 0, 0]}
            opacity={1.0}
            hide={index > 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={height * 0.22}
          outerRadius={height * 0.36}
          dataKey="value"
          stroke="none"
          animationBegin={200}
          animationDuration={800}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="text-sm font-medium">{data.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(data.value)} (
                    {((data.value / totalSpent) * 100).toFixed(1)}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderLineChart = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#2a2d3a" }}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#2a2d3a" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="budget"
          name="Budget"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e", r: 4 }}
          animationDuration={1000}
        />
        <Line
          type="monotone"
          dataKey="spent"
          name="Spent"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const ChartCard = ({
    id,
    title,
    children,
    empty,
    emptyMsg,
  }: {
    id: string;
    title: string;
    children: ReactNode;
    empty?: boolean;
    emptyMsg?: string;
  }) => (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {!empty && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFullscreenChart(id)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="flex h-52 items-center justify-center text-muted-foreground text-xs">
            {emptyMsg}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
    <div>
      {/* Mobile CTA - visible only on small screens */}
      <div className="mb-6 block sm:hidden">
        <Button
          onClick={() => setAddExpenseOpen(true)}
          className="w-full h-20 text-2xl font-semibold bg-primary hover:bg-primary/90"
        >
          <Plus className="size-6" />
          Add an Expense
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
          <p className="mt-0.5 text-muted-foreground">
            Your financial overview at a glance
          </p>
        </div>
        <MonthNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      {/* Summary Cards */}
      <div
        className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
        role="region"
        aria-label="Budget summary"
      >
        <div>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
              <Target className="h-3.5 w-3.5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {monthBudgets.length} categories budgeted
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <Wallet className="h-3.5 w-3.5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {monthExpenses.length} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Remaining
              </CardTitle>
              {remaining >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold ${remaining >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {formatCurrency(Math.abs(remaining))}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {remaining >= 0 ? "under budget" : "over budget"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Budget Used
              </CardTitle>
              {budgetUsedPct > 90 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{budgetUsedPct.toFixed(1)}%</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(budgetUsedPct, 100)}%`,
                    backgroundColor:
                      budgetUsedPct > 90
                        ? "#ef4444"
                        : budgetUsedPct > 70
                          ? "#f59e0b"
                          : "#22c55e",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
        <div>
          <ChartCard
            id="bar"
            title="Budget vs Actual"
            empty={barData.length === 0}
            emptyMsg="No data for this month."
          >
            {renderBarChart(220)}
          </ChartCard>
        </div>
        <div>
          <ChartCard
            id="pie"
            title="Spending Distribution"
            empty={pieData.length === 0}
            emptyMsg="No spending data."
          >
            {renderPieChart(220)}
          </ChartCard>
        </div>
      </div>

      {/* Trend + Top Categories */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard id="line" title="Monthly Trend (6 months)">
            {renderLineChart(200)}
          </ChartCard>
        </div>

        <div>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No spending yet
                </p>
              ) : (
                topCategories.map((cat) => {
                  const Icon = getIcon(cat.icon);
                  const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: cat.color }}
                          />
                          <span className="text-xs font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(cat.spent)}
                        </span>
                      </div>
                      {cat.limit > 0 && (
                        <div className="h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor:
                                pct > 100 ? "#ef4444" : cat.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fullscreen Chart Dialog */}
      <Dialog
        open={!!fullscreenChart}
        onOpenChange={() => setFullscreenChart(null)}
      >
        <DialogContent className="max-w-[95vw] h-[85vh] sm:max-w-5xl sm:h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {fullscreenChart === "bar" && "Budget vs Actual"}
              {fullscreenChart === "pie" && "Spending Distribution"}
              {fullscreenChart === "line" && "Monthly Trend (6 months)"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 pt-2">
            {fullscreenChart === "bar" &&
              renderBarChart(Math.min(window.innerHeight * 0.6, 500))}
            {fullscreenChart === "pie" &&
              renderPieChart(Math.min(window.innerHeight * 0.6, 500))}
            {fullscreenChart === "line" &&
              renderLineChart(Math.min(window.innerHeight * 0.6, 500))}
          </div>
        </DialogContent>
      </Dialog>

      <AddExpenseModal
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
      />
    </div>
    </PageTransition>
  );
}
