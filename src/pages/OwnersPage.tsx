import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useOwnerStore } from "@/stores/ownerStore";
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
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import type { Owner } from "@/types";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#e11d48",
];

function OwnerCard({
  owner,
  onEdit,
  onDelete,
}: {
  owner: Owner;
  onEdit: (owner: Owner) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: owner.color + "20", color: owner.color }}
        >
          {owner.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{owner.name}</p>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={() => onEdit(owner)}
            aria-label={`Edit ${owner.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(owner.id)}
            aria-label={`Delete ${owner.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function OwnersPage() {
  const { owners, addOwner, updateOwner, deleteOwner } = useOwnerStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const openNew = () => {
    setEditing(null);
    setName("");
    setColor(COLORS[0]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (owner: Owner) => {
    setEditing(owner);
    setName(owner.name);
    setColor(owner.color);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Owner name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    if (editing) {
      updateOwner(editing.id, { name, color });
    } else {
      addOwner({ name, color });
    }
    setDialogOpen(false);
  };

  return (
    <PageTransition>
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Owners</h1>
          <p className="mt-0.5 text-muted-foreground">
            Manage expense and budget owners
          </p>
        </div>
        <Button
          onClick={openNew}
          className="gap-2 h-10 px-4 w-full sm:w-auto"
          aria-label="Create new owner"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New Owner
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {owners.map((owner) => (
          <OwnerCard
            key={owner.id}
            owner={owner}
            onEdit={openEdit}
            onDelete={deleteOwner}
          />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Owner" : "New Owner"}
            </DialogTitle>
          </DialogHeader>
          <div className={`space-y-4 py-4 ${shaking ? "animate-shake" : ""}`}>
            <div className={`space-y-2 ${errors.name ? "field-error" : ""}`}>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
                placeholder="Owner name"
                className="h-11 text-base"
              />
              <div className="field-error-msg" data-visible={!!errors.name}>
                <span className="text-xs text-destructive pt-0.5">{errors.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition-all sm:h-7 sm:w-7",
                      color === c
                        ? "border-white scale-110"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
}
