import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ArrowUpDown, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getIcon } from '@/lib/icons';
import type { Expense } from '@/types';

type SortField = 'date' | 'amount' | 'description';
type SortDir = 'asc' | 'desc';

export function ExpensesPage() {
  const { categories } = useCategoryStore();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Form state
  const [formDate, setFormDate] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...expenses];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.description.toLowerCase().includes(q));
    }

    if (filterCategory && filterCategory !== 'all') {
      result = result.filter((e) => e.categoryId === filterCategory);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [expenses, search, filterCategory, sortField, sortDir]);

  const openNew = () => {
    setEditing(null);
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormDesc('');
    setFormAmount('');
    setFormCategory(categories[0]?.id || '');
    setDialogOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setFormDate(exp.date);
    setFormDesc(exp.description);
    setFormAmount(String(exp.amount));
    setFormCategory(exp.categoryId);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const amount = parseFloat(formAmount);
    if (!formDesc.trim() || isNaN(amount) || amount <= 0 || !formCategory) return;

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

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-1 text-muted-foreground">Track and manage your spending</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
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
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              Total: ${totalFiltered.toFixed(2)}
            </Badge>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3" onClick={() => toggleSort('date')}>
                      Date <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3" onClick={() => toggleSort('description')}>
                      Description <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 -mr-3 ml-auto" onClick={() => toggleSort('amount')}>
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        No expenses found. Click "Add Expense" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((exp) => {
                      const cat = getCat(exp.categoryId);
                      const Icon = cat ? getIcon(cat.icon) : getIcon('Tag');
                      return (
                        <motion.tr
                          key={exp.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group border-b border-border transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="text-muted-foreground">
                            {format(new Date(exp.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">{exp.description}</TableCell>
                          <TableCell>
                            {cat && (
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" style={{ color: cat.color }} />
                                <span className="text-sm">{cat.name}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            ${exp.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(exp)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteExpense(exp.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="What did you spend on?"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = getIcon(cat.icon);
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
