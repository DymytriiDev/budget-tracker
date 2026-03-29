import { useState, useMemo } from "react";
import { Plus, Trash2, ArrowUpDown, Search } from "lucide-react";
import { formatDate } from "@/lib/date";
import { useCategoryStore } from "@/stores/categoryStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useOwnerStore } from "@/stores/ownerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/currency";
import { getBudgetCycleMonth, isExpenseInCycle } from "@/lib/budgetCycle";
import { MonthNavigation } from "@/components/MonthNavigation";

type SortField = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

export function ExpensesPage() {
  const { categories } = useCategoryStore();
  const { expenses, deleteExpense } = useExpenseStore();
  const { owners } = useOwnerStore();
  const { monthStartDay } = useSettingsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const month = getBudgetCycleMonth(currentDate, monthStartDay);

  const filtered = useMemo(() => {
    let result = expenses.filter((e) => isExpenseInCycle(e.date, month, monthStartDay));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.description.toLowerCase().includes(q));
    }

    if (filterCategory && filterCategory !== "all") {
      result = result.filter((e) => e.categoryId === filterCategory);
    }

    if (filterOwner && filterOwner !== "all") {
      if (filterOwner === "none") {
        result = result.filter((e) => !e.ownerId);
      } else {
        result = result.filter((e) => e.ownerId === filterOwner);
      }
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [expenses, month, monthStartDay, search, filterCategory, filterOwner, sortField, sortDir]);

  const openNew = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const openEdit = (exp: any) => {
    setEditingExpense(exp);
    setDialogOpen(true);
  };

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PageTransition>
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Expenses</h1>
          <p className="mt-0.5 text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MonthNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
          <Button
            onClick={openNew}
            className="gap-2 h-10 px-4 w-full sm:w-auto"
            aria-label="Add new expense"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Expense
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search expenses..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search expenses"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label="Filter by category"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label="Filter by owner"
                >
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All owners</SelectItem>
                  <SelectItem value="none">No owner</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge
                variant="secondary"
                className="shrink-0 px-3 py-1.5 text-xs"
              >
                Total: {formatCurrency(totalFiltered)}
              </Badge>
            </div>
          </div>

          {/* Mobile card list */}
          <div
            className="space-y-2 md:hidden"
            role="list"
            aria-label="Expenses list"
          >
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No expenses found. Tap "Add Expense" to get started.
              </p>
            ) : (
              filtered.map((exp) => {
                const cat = getCat(exp.categoryId);
                const Icon = cat ? getIcon(cat.icon) : getIcon("Tag");
                return (
                  <div
                    key={exp.id}
                    role="listitem"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors active:bg-muted/50 cursor-pointer"
                    onClick={() => openEdit(exp)}
                    onKeyDown={(e) => e.key === "Enter" && openEdit(exp)}
                    tabIndex={0}
                    aria-label={`${exp.description || cat?.name || 'Expense'}, ${formatCurrency(exp.amount)}, ${formatDate(new Date(exp.date), "MMM dd, yyyy")}`}
                  >
                    {cat && (
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: cat.color }}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {exp.description || (cat ? cat.name : "Expense")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(exp.date), "MMM dd, yyyy HH:mm")}
                        {cat ? ` · ${cat.name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(exp.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExpense(exp.id);
                        }}
                        aria-label={`Delete ${exp.description || 'expense'}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 -ml-3"
                      onClick={() => toggleSort("date")}
                    >
                      Date{" "}
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 -ml-3"
                      onClick={() => toggleSort("description")}
                    >
                      Description{" "}
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 -mr-3 ml-auto"
                      onClick={() => toggleSort("amount")}
                    >
                      Amount{" "}
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-24">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No expenses found. Click "Add Expense" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((exp) => {
                    const cat = getCat(exp.categoryId);
                    const Icon = cat ? getIcon(cat.icon) : getIcon("Tag");
                    return (
                      <TableRow
                        key={exp.id}
                        className="group cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => openEdit(exp)}
                      >
                        <TableCell className="text-muted-foreground">
                          {formatDate(new Date(exp.date), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {exp.description || <span className="text-muted-foreground italic">{cat?.name || "No description"}</span>}
                        </TableCell>
                        <TableCell>
                          {cat && (
                            <div className="flex items-center gap-2">
                              <Icon
                                className="h-3.5 w-3.5"
                                style={{ color: cat.color }}
                                aria-hidden="true"
                              />
                              <span className="text-xs">{cat.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteExpense(exp.id);
                              }}
                              aria-label={`Delete ${exp.description || 'expense'}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddExpenseModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editingExpense}
      />
    </div>
    </PageTransition>
  );
}
