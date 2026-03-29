import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PageLoader } from "@/components/PageLoader";
import { Toaster } from "sonner";

const ExpensesPage = lazy(() => import("@/pages/ExpensesPage").then(m => ({ default: m.ExpensesPage })));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const BudgetsPage = lazy(() => import("@/pages/BudgetsPage").then(m => ({ default: m.BudgetsPage })));
const OwnersPage = lazy(() => import("@/pages/OwnersPage").then(m => ({ default: m.OwnersPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <AuthGuard>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<Suspense fallback={<PageLoader />}><ExpensesPage /></Suspense>} />
            <Route path="/categories" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>} />
            <Route path="/budgets" element={<Suspense fallback={<PageLoader />}><BudgetsPage /></Suspense>} />
            <Route path="/owners" element={<Suspense fallback={<PageLoader />}><OwnersPage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
