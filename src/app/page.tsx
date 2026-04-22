"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { SpendingChart } from "@/components/SpendingChart";

interface DashboardData {
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  categorySpending: {
    category: { id: string; name: string; color: string };
    amount: number;
  }[];
  recentTransactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    date: string;
    category: { name: string; color: string };
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-muted text-sm">
          {format(new Date(), "EEEE, MMM d")}
        </p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-primary rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} />
          <span className="text-sm opacity-90">Total Balance</span>
        </div>
        <p className="text-3xl font-bold break-words tabular-nums">
          ${data.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Income / Expenses Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-success mb-1">
            <TrendingUp size={16} />
            <span className="text-xs text-muted">Income</span>
          </div>
          <p className="text-lg font-semibold text-success">
            +${data.monthIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-danger mb-1">
            <TrendingDown size={16} />
            <span className="text-xs text-muted">Expenses</span>
          </div>
          <p className="text-lg font-semibold text-danger">
            -${data.monthExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Spending Chart */}
      {data.categorySpending.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h2 className="font-semibold mb-3">Spending by Category</h2>
          <SpendingChart data={data.categorySpending} />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="text-primary text-sm flex items-center gap-1"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <p className="text-muted text-sm p-4 pt-2">
            No transactions yet. Tap + to add one.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: t.category.color }}
                  >
                    {t.category.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{t.description}</p>
                    <p className="text-xs text-muted truncate">
                      {t.category.name} &middot;{" "}
                      {format(new Date(t.date), "MMM d")}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold text-sm shrink-0 tabular-nums ${
                    t.type === "income" ? "text-success" : "text-danger"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}$
                  {t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
