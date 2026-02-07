import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getIcon, AVAILABLE_ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899',
  '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
  '#e11d48', '#84cc16',
];

export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState(COLORS[0]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setIcon('Tag');
    setColor(COLORS[0]);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      updateCategory(editing.id, { name, icon, color });
    } else {
      addCategory({ name, icon, color });
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-muted-foreground">Manage your spending categories</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group relative overflow-hidden border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      <Icon className="h-6 w-6" style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">{cat.icon}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteCategory(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComp]) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                      icon === iconName
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    <IconComp className="h-5 w-5" />
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
                      'h-8 w-8 rounded-full border-2 transition-all',
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
