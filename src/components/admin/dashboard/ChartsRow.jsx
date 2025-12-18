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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function DashboardChartsRow({
  dailyData,
  summary,
  attendanceData,
  chartConfig,
}) {
  const totalToday = summary.attendanceToday?.total || 0;

  return (
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
          <CardDescription>{totalToday} students marked</CardDescription>
        </CardHeader>
        <CardContent>
          {totalToday > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                  <span>Present: {summary.attendanceToday?.present || 0}</span>
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
  );
}
