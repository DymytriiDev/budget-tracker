import { useState, useRef, useCallback, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/stores/categoryStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useOwnerStore } from "@/stores/ownerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getIcon } from "@/lib/icons";
import type { Expense } from "@/types";
import { format } from "date-fns";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  onSuccess?: () => void;
}

export function AddExpenseModal({
  open,
  onOpenChange,
  expense,
  onSuccess,
}: AddExpenseModalProps) {
  const { categories } = useCategoryStore();
  const { addExpense, updateExpense } = useExpenseStore();
  const { owners } = useOwnerStore();
  const { defaultOwnerId } = useSettingsStore();

  const [editing, setEditing] = useState<Expense | null>(null);
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formTime, setFormTime] = useState(format(new Date(), "HH:mm"));
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState(categories[0]?.id || "");
  const [formOwner, setFormOwner] = useState<string>(defaultOwnerId || "");
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

  const resetForm = useCallback(() => {
    setEditing(null);
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormTime(format(new Date(), "HH:mm"));
    setFormDesc("");
    setFormAmount("");
    setFormCategory(categories[0]?.id || "");
    setFormOwner(defaultOwnerId || "");
    setErrors({});
  }, [categories, defaultOwnerId]);

  useEffect(() => {
    if (open) {
      if (expense) {
        setEditing(expense);
        const expenseDate = new Date(expense.date);
        setFormDate(format(expenseDate, "yyyy-MM-dd"));
        setFormTime(format(expenseDate, "HH:mm"));
        setFormDesc(expense.description);
        setFormAmount(String(expense.amount));
        setFormCategory(expense.categoryId);
        setFormOwner(expense.ownerId || "");
        setErrors({});
      } else {
        setEditing(null);
        setFormDate(format(new Date(), "yyyy-MM-dd"));
        setFormTime(format(new Date(), "HH:mm"));
        setFormDesc("");
        setFormAmount("");
        setFormCategory(categories[0]?.id || "");
        setFormOwner(defaultOwnerId || "");
        setErrors({});
      }
    }
  }, [open, expense, categories, defaultOwnerId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formDate) newErrors.date = "Date is required";
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

    const isoDateTime = new Date(`${formDate}T${formTime}`).toISOString();

    if (editing) {
      updateExpense(editing.id, {
        date: isoDateTime,
        description: formDesc.trim(),
        amount,
        categoryId: formCategory,
        ownerId: formOwner || undefined,
      });
    } else {
      addExpense({
        date: isoDateTime,
        description: formDesc.trim(),
        amount,
        categoryId: formCategory,
        ownerId: formOwner || undefined,
      });
    }
    onOpenChange(false);
    onSuccess?.();
  };

  const handleAmountChange = (value: string) => {
    const normalized = value.replace(",", ".");
    const cleaned = normalized.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    if (parts.length === 2 && parts[1].length > 2) return;
    setFormAmount(formatted);
    clearError("amount");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Expense" : "New Expense"}
          </DialogTitle>
        </DialogHeader>
        <div ref={formRef} className={`space-y-4 py-4 ${shaking ? "animate-shake" : ""}`}>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                className="h-11 text-base"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
              />
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
          <div className="space-y-2">
            <Label>Owner (optional)</Label>
            <Select value={formOwner ? formOwner : "none"} onValueChange={(v) => setFormOwner(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="No owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No owner</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
