# Budget Tracker

A modern personal finance management application for tracking expenses, managing budgets, and visualizing spending patterns.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDymytriiDev%2Fbudget-tracker%2Fdb&env=AUTH_TOKEN&envDescription=Authentication%20token%20for%20API%20access&envLink=https%3A%2F%2Fgithub.com%2FDymytriiDev%2Fbudget-tracker%23environment-variables&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%5D)

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

- Cloud synchronization via Neon Postgres database
- Token-based authentication
- Automatic state persistence
- Auto-migration on first request

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: TailwindCSS, shadcn/ui, Lucide icons
- **Charts**: Recharts
- **State**: Zustand
- **Routing**: React Router
- **Deployment**: Vercel
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle

## Deploy Your Own

Click the button above to deploy your own instance. Vercel will:

1. Clone the repository
2. Create a Neon Postgres database automatically
3. Prompt you to set the `AUTH_TOKEN` environment variable
4. Deploy the app

The database tables are created automatically on first API request.

## Getting Started (Local Development)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

- `AUTH_TOKEN` - Authentication token for API access (required)
- `POSTGRES_URL` - Neon Postgres connection string (auto-set by Vercel)
