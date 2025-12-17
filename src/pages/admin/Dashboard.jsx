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
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getSummaryReport,
  getCanteenStats,
  getTransactions,
} from "@/api/admin";

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

  // Prepare room occupancy data
  const roomData = [
    {
      name: "Occupied",
      value: summary.occupiedRooms || 0,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Available",
      value: summary.availableRooms || 0,
      fill: "hsl(var(--chart-3))",
    },
  ];

  // Prepare revenue comparison data
  const revenueData = [
    {
      name: "Today",
      credits: canteenStats.today?.credits || 0,
      debits: canteenStats.today?.debits || 0,
    },
    {
      name: "This Month",
      credits: canteenStats.thisMonth?.credits || 0,
      debits: canteenStats.thisMonth?.debits || 0,
    },
    {
      name: "All Time",
      credits: canteenStats.allTime?.totalCredits || 0,
      debits: canteenStats.allTime?.totalDebits || 0,
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of hostel management system statistics.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <HugeiconsIcon
              icon={UserMultipleIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : summary.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Status</CardTitle>
            <HugeiconsIcon
              icon={Door01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `${summary.occupiedRooms || 0}/${summary.totalRooms || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.availableRooms || 0} rooms available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Leaves
            </CardTitle>
            <HugeiconsIcon
              icon={Notebook01Icon}
              className="h-4 w-4 text-orange-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? "..." : summary.pendingLeaves || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Complaints
            </CardTitle>
            <HugeiconsIcon
              icon={Message01Icon}
              className="h-4 w-4 text-red-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isLoading ? "..." : summary.pendingComplaints || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Canteen Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <HugeiconsIcon
              icon={CreditCardIcon}
              className="h-4 w-4 text-green-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(canteenStats.today?.debits)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                className="mr-1 h-3 w-3 text-green-500"
              />
              {formatCurrency(canteenStats.today?.credits)} credited
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <HugeiconsIcon
              icon={Analytics01Icon}
              className="h-4 w-4 text-blue-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(canteenStats.thisMonth?.debits)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                className="mr-1 h-3 w-3 text-green-500"
              />
              {formatCurrency(canteenStats.thisMonth?.credits)} credited
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <HugeiconsIcon
              icon={
                canteenStats.allTime?.netBalance >= 0
                  ? ArrowUp01Icon
                  : ArrowDown01Icon
              }
              className={`h-4 w-4 ${
                canteenStats.allTime?.netBalance >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                canteenStats.allTime?.netBalance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(canteenStats.allTime?.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Net wallet balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Badge variant="secondary">
              {canteenStats.transactionCount || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(canteenStats.allTime?.totalDebits)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spent all time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Transactions Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Trends (Last 7 Days)</CardTitle>
            <CardDescription>Daily credits and debits overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => `₹${value}`}
                  />
                  <Bar
                    dataKey="credits"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    name="Credits"
                  />
                  <Bar
                    dataKey="debits"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                    name="Debits"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Attendance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {summary.attendanceToday?.total || 0} students marked
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.attendanceToday?.total > 0 ? (
              <>
                <ChartContainer
                  config={chartConfig}
                  className="h-[200px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                    <span>
                      Present: {summary.attendanceToday?.present || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                    <span>Absent: {summary.attendanceToday?.absent || 0}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No attendance data for today
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Room Occupancy & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Room Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Room Occupancy</CardTitle>
            <CardDescription>Current room allocation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Occupancy Rate
              </span>
              <span className="text-sm font-medium">
                {summary.totalRooms > 0
                  ? Math.round(
                      ((summary.occupiedRooms || 0) / summary.totalRooms) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                summary.totalRooms > 0
                  ? ((summary.occupiedRooms || 0) / summary.totalRooms) * 100
                  : 0
              }
              className="h-2"
            />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {summary.totalRooms || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {summary.occupiedRooms || 0}
                </div>
                <div className="text-xs text-muted-foreground">Occupied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {summary.availableRooms || 0}
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <HugeiconsIcon
                      icon={UserMultipleIcon}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Students</p>
                    <p className="text-xs text-muted-foreground">
                      Total registered
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold">
                  {summary.totalStudents || 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <HugeiconsIcon
                      icon={Notebook01Icon}
                      className="h-4 w-4 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Leaves</p>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600">
                  {summary.pendingLeaves || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                    <HugeiconsIcon
                      icon={Message01Icon}
                      className="h-4 w-4 text-red-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Open Complaints</p>
                    <p className="text-xs text-muted-foreground">
                      Need attention
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-red-600">
                  {summary.pendingComplaints || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      className="h-4 w-4 text-green-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Attendance Today</p>
                    <p className="text-xs text-muted-foreground">
                      {summary.attendanceToday?.percentage || 0}% present
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {summary.attendanceToday?.present || 0}/
                  {summary.attendanceToday?.total || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
