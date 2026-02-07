import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertTriangle,
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIcon } from "@/lib/icons";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

export function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = format(currentDate, "yyyy-MM");
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const { expenses } = useExpenseStore();

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === month),
    [budgets, month],
  );
  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month],
  );

  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const budgetUsedPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Budget vs Actual bar chart data
  const barData = useMemo(() => {
    return categories
      .map((cat) => {
        const budget = monthBudgets.find((b) => b.categoryId === cat.id);
        const spent = monthExpenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((s, e) => s + e.amount, 0);
        if (!budget && spent === 0) return null;
        return {
          name: cat.name.length > 12 ? cat.name.slice(0, 12) + "…" : cat.name,
          budget: budget?.limit || 0,
          spent,
          color: cat.color,
        };
      })
      .filter(Boolean);
  }, [categories, monthBudgets, monthExpenses]);

  // Pie chart data (spending distribution)
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

  // Monthly trend line chart (last 6 months)
  const trendData = useMemo(() => {
    const months: { month: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(startOfMonth(currentDate), i);
      months.push({
        month: format(d, "yyyy-MM"),
        label: format(d, "MMM"),
      });
    }
    return months.map((m) => {
      const spent = expenses
        .filter((e) => e.date.startsWith(m.month))
        .reduce((s, e) => s + e.amount, 0);
      const budgetTotal = budgets
        .filter((b) => b.month === m.month)
        .reduce((s, b) => s + b.limit, 0);
      return { name: m.label, spent, budget: budgetTotal };
    });
  }, [currentDate, expenses, budgets]);

  // Top spending categories for current month
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
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Your financial overview at a glance
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

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalBudget.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {monthBudgets.length} categories budgeted
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalSpent.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {monthExpenses.length} transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
              {remaining >= 0 ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${remaining >= 0 ? "text-primary" : "text-destructive"}`}
              >
                ${Math.abs(remaining).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {remaining >= 0 ? "under budget" : "over budget"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Used
              </CardTitle>
              {budgetUsedPct > 90 ? (
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{budgetUsedPct.toFixed(1)}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      budgetUsedPct > 90
                        ? "#ef4444"
                        : budgetUsedPct > 70
                          ? "#f59e0b"
                          : "#22c55e",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget vs Actual */}
        <motion.div initial="hidden" animate="visible" variants={chartVariants}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No data for this month. Add budgets and expenses to see the
                  chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
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
                    <Bar
                      dataKey="budget"
                      name="Budget"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                      opacity={0.5}
                    />
                    <Bar
                      dataKey="spent"
                      name="Spent"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Distribution Pie */}
        <motion.div initial="hidden" animate="visible" variants={chartVariants}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No spending data for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
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
                                ${data.value.toFixed(2)} (
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
                        <span className="text-xs text-muted-foreground">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend + Top Categories Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Trend */}
        <motion.div
          className="lg:col-span-2"
          initial="hidden"
          animate="visible"
          variants={chartVariants}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">
                Monthly Trend (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div initial="hidden" animate="visible" variants={chartVariants}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCategories.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No spending yet
                </p>
              ) : (
                topCategories.map((cat, i) => {
                  const Icon = getIcon(cat.icon);
                  const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-4 w-4"
                            style={{ color: cat.color }}
                          />
                          <span className="text-sm font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          ${cat.spent.toFixed(2)}
                        </span>
                      </div>
                      {cat.limit > 0 && (
                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                pct > 100 ? "#ef4444" : cat.color,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
