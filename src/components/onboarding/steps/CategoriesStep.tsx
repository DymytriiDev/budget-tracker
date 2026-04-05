import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, Tag } from 'lucide-react';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getIcon, AVAILABLE_ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoriesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#e11d48',
];

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f97316' },
  { name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Entertainment', icon: 'Gamepad2', color: '#8b5cf6' },
  { name: 'Bills & Utilities', icon: 'Zap', color: '#eab308' },
  { name: 'Health', icon: 'Heart', color: '#ef4444' },
  { name: 'Housing', icon: 'Home', color: '#14b8a6' },
  { name: 'Education', icon: 'GraduationCap', color: '#06b6d4' },
  { name: 'Travel', icon: 'Plane', color: '#22c55e' },
  { name: 'Personal Care', icon: 'Shirt', color: '#a855f7' },
];

export function CategoriesStep({ onNext, onBack }: CategoriesStepProps) {
  const { categories, addCategory, deleteCategory } = useCategoryStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState(COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);

  const handleAddDefaults = () => {
    DEFAULT_CATEGORIES.forEach((cat) => {
      const exists = categories.some(
        (c) => c.name.toLowerCase() === cat.name.toLowerCase()
      );
      if (!exists) {
        addCategory(cat);
      }
    });
  };

  const openNewDialog = () => {
    setName('');
    setIcon('Tag');
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Category name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    addCategory({ name: name.trim(), icon, color });
    setDialogOpen(false);
  };

  const handleNext = () => {
    if (categories.length === 0) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Tag className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Set Up Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Create categories to organize your expenses
        </p>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-muted-foreground">
              No categories yet. Start with our suggestions or create your own.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={handleAddDefaults} variant="default">
                Add Default Categories
              </Button>
              <Button onClick={openNewDialog} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${shaking ? 'animate-shake' : ''}`}>
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <Card key={cat.id} className="group">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>
                    <span className="flex-1 truncate font-medium">
                      {cat.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-2">
            <Button onClick={handleAddDefaults} variant="outline" size="sm">
              Add Defaults
            </Button>
            <Button onClick={openNewDialog} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom
            </Button>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="gap-2" disabled={categories.length === 0}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <div className={`space-y-4 py-2 ${shaking ? 'animate-shake' : ''}`}>
            <div className={`space-y-2 ${errors.name ? 'field-error' : ''}`}>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({});
                }}
                placeholder="Category name"
                className="h-11 text-base"
              />
              <div className="field-error-msg" data-visible={!!errors.name}>
                <span className="pt-0.5 text-xs text-destructive">
                  {errors.name}
                </span>
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
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-all sm:h-9 sm:w-9',
                      icon === iconName
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    <IconComp className="h-4 w-4" />
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
                      'h-9 w-9 rounded-full border-2 transition-all sm:h-7 sm:w-7',
                      color === c ? 'scale-110 border-white' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
