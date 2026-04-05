# Budget Tracker

A modern personal finance management application for tracking expenses, managing budgets, and visualizing spending patterns.

## Features

### **Dashboard**
- Real-time financial overview with key metrics (total budget, spent, remaining, budget usage %)
- Interactive charts: budget vs actual spending, spending distribution pie chart, 6-month trend analysis
- Top spending categories with visual progress indicators
- Customizable budget cycles with configurable month start dates

### **Expense Management**
- Add, edit, and delete expenses with category assignment
- Advanced filtering by category, owner, and search terms
- Sortable expense table (by date, amount, description)
- Monthly expense tracking aligned with budget cycles
- Mobile-optimized card view and desktop table view

### **Budget Planning**
- Set monthly spending limits per category
- Visual progress bars showing budget utilization
- Budget split functionality for shared expenses between multiple owners
- Real-time budget vs actual comparison
- Warnings for categories exceeding limits

### **Categories & Owners**
- Custom expense categories with icons and colors
- Drag-and-drop category reordering
- Multi-owner support for shared budget management
- Owner-specific budget allocations

### **Data Sync**
- Cloud synchronization via Vercel Blob storage
- Token-based authentication
- Automatic state persistence
- Local development mode

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: TailwindCSS, shadcn/ui, Lucide icons
- **Charts**: Recharts
- **State**: Zustand
- **Routing**: React Router
- **Deployment**: Vercel
- **Storage**: Vercel Blob

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

- `AUTH_TOKEN` - Authentication token for API access
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
