import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { getDashboardStats } from "@/api/student";

const walletChartConfig = {
  credit: {
    label: "Credits",
    color: "var(--primary)",
  },
  debit: {
    label: "Debits",
    color: "hsl(var(--destructive))",
  },
};

const leavesChartConfig = {
  PENDING: {
    label: "Pending",
    // Use direct colors so slices are not black even if theme tokens are missing
    color: "#facc15", // amber
  },
  APPROVED: {
    label: "Approved",
    color: "#22c55e", // green
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444", // red
  },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["student", "dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data || {};
  const attendance = stats.attendance || {};
  const wallet = stats.wallet || {};
  const leaves = stats.leaves || {};
  const complaints = stats.complaints || {};

  const walletChartData = useMemo(() => {
    const txs = wallet.recentTransactions || [];
    if (!Array.isArray(txs) || txs.length === 0) return [];

    const byDate = new Map();

    txs.forEach((tx) => {
      if (!tx?.date || typeof tx.amount !== "number") return;
      const d = new Date(tx.date);
      if (Number.isNaN(d.getTime())) return;

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const existing = byDate.get(key) || {
        date: key,
        credit: 0,
        debit: 0,
      };

      if (tx.type === "CREDIT") {
        existing.credit += tx.amount;
      } else if (tx.type === "DEBIT") {
        existing.debit += tx.amount;
      }

      byDate.set(key, existing);
    });

    return Array.from(byDate.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [wallet.recentTransactions]);

  const recentLeaves = (leaves.recent || []).slice(0, 5);
  const recentComplaints = (complaints.recent || []).slice(0, 5);
  const recentTransactions = (wallet.recentTransactions || []).slice(0, 5);

  const leavePieData = useMemo(() => {
    const summary = leaves.summary || {};
    const data = ["PENDING", "APPROVED", "REJECTED"].map((status) => ({
      status,
      value: summary[status] || 0,
    }));

    // If all values are zero, return empty to show "no data"
    if (data.every((d) => d.value === 0)) return [];

    return data;
  }, [leaves.summary]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `${
                    attendance.percentage?.toFixed?.(1) ??
                    attendance.percentage ??
                    0
                  }%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Present {attendance.present ?? 0} / {attendance.total ?? 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatCurrency(wallet.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : leaves.pendingCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total:{" "}
              {(leaves.summary?.PENDING ?? 0) +
                (leaves.summary?.APPROVED ?? 0) +
                (leaves.summary?.REJECTED ?? 0)}
              {"  "}requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : complaints.openCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending: {complaints.summary?.PENDING ?? 0} • Resolved:{" "}
              {complaints.summary?.RESOLVED ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Wallet chart - span 2 columns on large screens */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Wallet activity</CardTitle>
              <CardDescription>
                Recent credits and debits over time
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {isLoading ? (
                <div className="h-[240px] animate-pulse rounded-md bg-muted" />
              ) : walletChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No wallet transactions to display yet.
                </p>
              ) : (
                <ChartContainer
                  config={walletChartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart data={walletChartData} stackOffset="sign">
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      minTickGap={10}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        });
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          }
                          indicator="dot"
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="credit"
                      name="Credits"
                      stackId="wallet"
                      fill="#2563eb" // Professional blue (Blue-600)
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="debit"
                      name="Debits"
                      stackId="wallet"
                      fill="#f59e42" // Professional amber (Amber-500)
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave status</CardTitle>
              <CardDescription>
                Distribution of your leave requests
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {isLoading ? (
                <div className="h-[240px] animate-pulse rounded-md bg-muted" />
              ) : leavePieData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No leave data to display yet.
                </p>
              ) : (
                <ChartContainer
                  config={leavesChartConfig}
                  className="mx-auto h-[250px] max-w-xs"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="status"
                          labelKey="status"
                          indicator="dot"
                        />
                      }
                    />
                    <ChartLegend
                      verticalAlign="bottom"
                      content={<ChartLegendContent nameKey="status" />}
                    />
                    <Pie
                      data={leavePieData}
                      dataKey="value"
                      nameKey="status"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {leavePieData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={`var(--color-${entry.status})`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column: recent activity */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Leaves</CardTitle>
              <CardDescription>Last few leave requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="h-[120px] animate-pulse rounded-md bg-muted" />
              ) : recentLeaves.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You have not submitted any leave requests yet.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {recentLeaves.map((leave) => (
                    <li
                      key={leave.id}
                      className="flex items-center justify-between rounded-md border px-2 py-1.5"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium">
                          {new Date(leave.fromDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(leave.toDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Applied on{" "}
                          {new Date(leave.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        {leave.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Complaints</CardTitle>
              <CardDescription>Your latest complaint activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="h-[120px] animate-pulse rounded-md bg-muted" />
              ) : recentComplaints.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No complaints logged yet.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {recentComplaints.map((complaint) => (
                    <li
                      key={complaint.id}
                      className="flex items-center justify-between rounded-md border px-2 py-1.5"
                    >
                      <div className="space-y-0.5">
                        <p className="line-clamp-1 font-medium">
                          {complaint.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Created{" "}
                          {new Date(complaint.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        {complaint.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Transactions</CardTitle>
              <CardDescription>Last few wallet movements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="h-[120px] animate-pulse rounded-md bg-muted" />
              ) : recentTransactions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No transactions available.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {recentTransactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between rounded-md border px-2 py-1.5"
                    >
                      <div className="space-y-0.5">
                        <p className="line-clamp-1 font-medium">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-semibold ${
                            tx.type === "CREDIT"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.type}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
