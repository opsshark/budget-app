"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  category: Category;
  spent: number;
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  function loadBudgets() {
    fetch(`/api/budgets?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setBudgets)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBudgets();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setCategories(cats.filter((c) => c.name !== "Income"));
        if (cats.length) setNewBudgetCategory(cats[0].id);
      });
  }, [month, year]);

  async function handleAddBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetAmount) return;

    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: newBudgetAmount,
        month,
        year,
        categoryId: newBudgetCategory,
      }),
    });

    setNewBudgetAmount("");
    setShowForm(false);
    loadBudgets();
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-muted text-sm">
          {format(new Date(year, month - 1), "MMMM yyyy")}
        </p>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Total Budget</span>
            <span className="font-semibold">
              ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })} / $
              {totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                backgroundColor:
                  totalSpent > totalBudget ? "#ef4444" : "#3b82f6",
              }}
            />
          </div>
        </div>
      )}

      {/* Budget Items */}
      <div className="space-y-3">
        {budgets.map((b) => {
          const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
          const over = b.spent > b.amount;
          return (
            <div
              key={b.id}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.category.color }}
                  />
                  <span className="font-medium text-sm">
                    {b.category.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    over ? "text-danger" : "text-foreground"
                  }`}
                >
                  ${b.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })} / $
                  {b.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: over
                      ? "#ef4444"
                      : b.category.color,
                  }}
                />
              </div>
              {over && (
                <p className="text-xs text-danger mt-1">
                  Over budget by $
                  {(b.spent - b.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Budget Form */}
      {showForm ? (
        <form
          onSubmit={handleAddBudget}
          className="bg-card rounded-xl p-4 border border-border space-y-3"
        >
          <h3 className="font-semibold">Set Budget</h3>
          <select
            value={newBudgetCategory}
            onChange={(e) => setNewBudgetCategory(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newBudgetAmount}
            onChange={(e) => setNewBudgetAmount(e.target.value)}
            placeholder="Budget amount"
            className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm"
        >
          + Add Budget
        </button>
      )}
    </div>
  );
}
