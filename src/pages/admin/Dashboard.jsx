import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultipleIcon,
  Door01Icon,
  Notebook01Icon,
  Message01Icon,
  Calendar03Icon,
  CreditCardIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  getSummaryReport,
  getCanteenStats,
  getTransactions,
} from "@/api/admin";
import { DashboardQuickStats } from "@/components/admin/dashboard/QuickStats";
import { DashboardCanteenStats } from "@/components/admin/dashboard/CanteenStats";
import { DashboardChartsRow } from "@/components/admin/dashboard/ChartsRow";
import { DashboardRoomAndOverview } from "@/components/admin/dashboard/RoomAndOverview";

// Chart config
const chartConfig = {
  credits: {
    label: "Credits",
    color: "hsl(var(--chart-1))",
  },
  debits: {
    label: "Debits",
    color: "hsl(var(--chart-2))",
  },
  present: {
    label: "Present",
    color: "hsl(var(--chart-1))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-2))",
  },
};

export default function AdminDashboard() {
  // Fetch summary report
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: getSummaryReport,
  });

  // Fetch canteen stats
  const { data: canteenData, isLoading: canteenLoading } = useQuery({
    queryKey: ["admin", "canteen-stats"],
    queryFn: getCanteenStats,
  });

  // Fetch recent transactions for chart
  const { data: transactionsData } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: getTransactions,
  });

  const summary = summaryData?.data || {};
  const canteenStats = canteenData?.data || {};
  const transactions = transactionsData?.data?.transactions || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Prepare attendance pie chart data
  const attendanceData = [
    {
      name: "Present",
      value: summary.attendanceToday?.present || 0,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Absent",
      value: summary.attendanceToday?.absent || 0,
      fill: "hsl(var(--chart-2))",
    },
  ];

  // Process transactions for daily chart (last 7 days)
  const getDailyTransactionData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push({
        date: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        credits: 0,
        debits: 0,
      });
    }

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date || tx.createdAt)
        .toISOString()
        .split("T")[0];
      const dayData = last7Days.find((d) => d.date === txDate);
      if (dayData) {
        if (tx.type === "CREDIT") {
          dayData.credits += tx.amount;
        } else {
          dayData.debits += tx.amount;
        }
      }
    });

    return last7Days;
  };

  const dailyData = getDailyTransactionData();

  const isLoading = summaryLoading || canteenLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight"> Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Hostel statistics.
        </p>
      </div> */}

      {/* Quick Stats */}
      <DashboardQuickStats summary={summary} isLoading={isLoading} />

      {/* Canteen Revenue Stats */}
      <DashboardCanteenStats
        canteenStats={canteenStats}
        formatCurrency={formatCurrency}
      />

      {/* Charts Row */}
      <DashboardChartsRow
        dailyData={dailyData}
        summary={summary}
        attendanceData={attendanceData}
        chartConfig={chartConfig}
      />

      {/* Room Occupancy & Quick Overview */}
      <DashboardRoomAndOverview summary={summary} />
    </div>
  );
}
