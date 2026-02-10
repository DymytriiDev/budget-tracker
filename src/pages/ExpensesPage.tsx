import { useState, useMemo, useRef, useCallback } from "react";
import { Plus, Trash2, ArrowUpDown, Search } from "lucide-react";
import { format } from "date-fns";
import { useCategoryStore } from "@/stores/categoryStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/currency";
import type { Expense } from "@/types";

type SortField = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

export function ExpensesPage() {
  const { categories } = useCategoryStore();
  const { expenses, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...expenses];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.description.toLowerCase().includes(q));
    }

    if (filterCategory && filterCategory !== "all") {
      result = result.filter((e) => e.categoryId === filterCategory);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [expenses, search, filterCategory, sortField, sortDir]);

  const openNew = () => {
    setEditing(null);
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormDesc("");
    setFormAmount("");
    setFormCategory(categories[0]?.id || "");
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setFormDate(exp.date);
    setFormDesc(exp.description);
    setFormAmount(String(exp.amount));
    setFormCategory(exp.categoryId);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formDate) newErrors.date = "Date is required";
    if (!formDesc.trim()) newErrors.desc = "Description is required";
    const amount = parseFloat(formAmount);
    if (!formAmount.trim()) newErrors.amount = "Amount is required";
    else if (isNaN(amount) || amount <= 0) newErrors.amount = "Enter a valid amount";
    if (!formCategory) newErrors.category = "Select a category";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    if (editing) {
      updateExpense(editing.id, {
        date: formDate,
        description: formDesc,
        amount,
        categoryId: formCategory,
      });
    } else {
      addExpense({
        date: formDate,
        description: formDesc,
        amount,
        categoryId: formCategory,
      });
    }
    setDialogOpen(false);
  };

  const handleAmountChange = (value: string) => {
    // Allow only digits and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    // Prevent multiple dots
    const parts = cleaned.split(".");
    const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) return;
    setFormAmount(formatted);
    clearError("amount");
  };

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Expenses</h1>
          <p className="mt-0.5 text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <Button
          onClick={openNew}
          className="gap-2 h-10 px-4 w-full sm:w-auto"
          aria-label="Add new expense"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Expense
        </Button>
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
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger
                  className="w-full sm:w-48"
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
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors active:bg-muted/50"
                    onClick={() => openEdit(exp)}
                    onKeyDown={(e) => e.key === "Enter" && openEdit(exp)}
                    tabIndex={0}
                    aria-label={`${exp.description}, ${formatCurrency(exp.amount)}, ${format(new Date(exp.date), "MMM dd, yyyy")}`}
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
                        {exp.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(exp.date), "MMM dd, yyyy")}
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
                        aria-label={`Delete ${exp.description}`}
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
                          {format(new Date(exp.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {exp.description}
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
                              aria-label={`Delete ${exp.description}`}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Expense" : "New Expense"}
            </DialogTitle>
          </DialogHeader>
          <div ref={formRef} className={`space-y-4 py-4 ${shaking ? "animate-shake" : ""}`}>
            <div className={`space-y-2 ${errors.date ? "field-error" : ""}`}>
              <Label>Date</Label>
              <Input
                type="date"
                className="h-11 text-base"
                value={formDate}
                onChange={(e) => { setFormDate(e.target.value); clearError("date"); }}
              />
              <div className="field-error-msg" data-visible={!!errors.date}>
                <span className="text-xs text-destructive pt-0.5">{errors.date}</span>
              </div>
            </div>
            <div className={`space-y-2 ${errors.desc ? "field-error" : ""}`}>
              <Label>Description</Label>
              <Input
                placeholder="What did you spend on?"
                className="h-11 text-base"
                value={formDesc}
                onChange={(e) => { setFormDesc(e.target.value); clearError("desc"); }}
              />
              <div className="field-error-msg" data-visible={!!errors.desc}>
                <span className="text-xs text-destructive pt-0.5">{errors.desc}</span>
              </div>
            </div>
            <div className={`space-y-2 ${errors.amount ? "field-error" : ""}`}>
              <Label>Amount (€)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">€</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.00"
                  className="h-11 text-base pl-8 tabular-nums"
                  value={formAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </div>
              <div className="field-error-msg" data-visible={!!errors.amount}>
                <span className="text-xs text-destructive pt-0.5">{errors.amount}</span>
              </div>
            </div>
            <div className={`space-y-2 ${errors.category ? "field-error" : ""}`}>
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={(v) => { setFormCategory(v); clearError("category"); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = getIcon(cat.icon);
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-4 w-4"
                            style={{ color: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="field-error-msg" data-visible={!!errors.category}>
                <span className="text-xs text-destructive pt-0.5">{errors.category}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
