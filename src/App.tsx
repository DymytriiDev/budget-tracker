import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { BudgetsPage } from "@/pages/BudgetsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
