"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  category: { name: string; color: string };
  account: { name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  // Group transactions by date
  const grouped: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const key = format(new Date(t.date), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link
          href="/transactions/new"
          className="bg-primary text-white rounded-full p-2"
        >
          <Plus size={20} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-4">No transactions yet</p>
          <Link
            href="/transactions/new"
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Add your first transaction
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([date, txns]) => (
          <div key={date}>
            <p className="text-sm text-muted font-medium mb-2">
              {format(new Date(date), "EEEE, MMM d, yyyy")}
            </p>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {txns.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: t.category.color }}
                    >
                      {t.category.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-muted">
                        {t.category.name} &middot; {t.account.name}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold text-sm ${
                      t.type === "income" ? "text-success" : "text-danger"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}$
                    {t.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
