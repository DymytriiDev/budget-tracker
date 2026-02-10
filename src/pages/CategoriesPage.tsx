import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCategoryStore } from "@/stores/categoryStore";
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
import { getIcon, AVAILABLE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#a855f7",
  "#e11d48",
  "#84cc16",
];

function SortableCategoryCard({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = getIcon(cat.icon);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group relative overflow-hidden border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            aria-label={`Reorder ${cat.name}`}
            aria-roledescription="sortable"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: cat.color + "20" }}
          >
            <Icon className="h-5 w-5" style={{ color: cat.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{cat.name}</p>
            <p className="text-xs text-muted-foreground">{cat.icon}</p>
          </div>
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-7 sm:w-7"
              onClick={() => onEdit(cat)}
              aria-label={`Edit ${cat.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-7 sm:w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(cat.id)}
              aria-label={`Delete ${cat.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CategoriesPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useCategoryStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      reorderCategories(arrayMove(categories, oldIndex, newIndex));
    }
  };

  const openNew = () => {
    setEditing(null);
    setName("");
    setIcon("Tag");
    setColor(COLORS[0]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Category name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    if (editing) {
      updateCategory(editing.id, { name, icon, color });
    } else {
      addCategory({ name, icon, color });
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Categories</h1>
          <p className="mt-0.5 text-muted-foreground">
            Manage your spending categories
          </p>
        </div>
        <Button
          onClick={openNew}
          className="gap-2 h-10 px-4 w-full sm:w-auto"
          aria-label="Create new category"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New Category
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <SortableCategoryCard
                key={cat.id}
                cat={cat}
                onEdit={openEdit}
                onDelete={deleteCategory}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className={`space-y-4 py-4 ${shaking ? "animate-shake" : ""}`}>
            <div className={`space-y-2 ${errors.name ? "field-error" : ""}`}>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
                placeholder="Category name"
                className="h-11 text-base"
              />
              <div className="field-error-msg" data-visible={!!errors.name}>
                <span className="text-xs text-destructive pt-0.5">{errors.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7">
                {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComp]) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border transition-all sm:h-9 sm:w-9",
                      icon === iconName
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                    aria-label={iconName}
                    aria-pressed={icon === iconName}
                  >
                    <IconComp className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
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
  );
}
