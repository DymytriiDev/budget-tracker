import { useState } from 'react';
import { ArrowLeft, ArrowRight, Users, Plus, Trash2 } from 'lucide-react';
import { useOwnerStore } from '@/stores/ownerStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
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
import { cn } from '@/lib/utils';

interface OwnersStepProps {
  onNext: () => void;
  onBack: () => void;
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
];

export function OwnersStep({ onNext, onBack }: OwnersStepProps) {
  const { owners, addOwner, deleteOwner } = useOwnerStore();
  const { skipStep } = useOnboardingStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);

  const openNewDialog = () => {
    setName('');
    setColor(COLORS[owners.length % COLORS.length]);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    addOwner({ name: name.trim(), color });
    setDialogOpen(false);
  };

  const handleSkip = () => {
    skipStep('owners');
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Add Family Members</h1>
        <p className="mt-2 text-muted-foreground">
          Track expenses by person for detailed analytics (optional)
        </p>
      </div>

      {owners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-muted-foreground">
              No family members added yet. Add people to track individual spending.
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {owners.map((owner) => (
              <Card key={owner.id} className="group">
                <CardContent className="flex items-center gap-3 p-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-semibold"
                    style={{ backgroundColor: owner.color }}
                  >
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate font-medium">
                    {owner.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => deleteOwner(owner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button onClick={openNewDialog} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Another
            </Button>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {owners.length === 0 && (
            <Button onClick={handleSkip} variant="outline">
              Skip
            </Button>
          )}
          <Button onClick={onNext} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
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
                placeholder="Person's name"
                className="h-11 text-base"
              />
              <div className="field-error-msg" data-visible={!!errors.name}>
                <span className="pt-0.5 text-xs text-destructive">
                  {errors.name}
                </span>
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
            <Button onClick={handleSave}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
