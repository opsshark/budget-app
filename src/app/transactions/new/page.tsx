"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]).then(([cats, accs]) => {
      setCategories(cats);
      setAccounts(accs);
      if (cats.length) setCategoryId(cats[0].id);
      if (accs.length) setAccountId(accs[0].id);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !categoryId || !accountId) return;

    setSubmitting(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        type,
        description,
        date,
        categoryId,
        accountId,
      }),
    });
    router.push("/transactions");
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 pt-2 mb-6">
        <Link href="/transactions" className="text-muted">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Add Transaction</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        <div className="flex bg-background rounded-xl p-1 border border-border">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              type === "expense"
                ? "bg-danger text-white"
                : "text-muted"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              type === "income"
                ? "bg-success text-white"
                : "text-muted"
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery shopping"
            className="w-full bg-card border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors min-w-0 ${
                  categoryId === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <div
                  className="w-3 h-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
