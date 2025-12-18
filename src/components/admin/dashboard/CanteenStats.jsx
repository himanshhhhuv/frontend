import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardCanteenStats({ canteenStats, formatCurrency }) {
  const netBalance = canteenStats.allTime?.netBalance ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
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
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
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
            icon={netBalance >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
            className={`h-4 w-4 ${
              netBalance >= 0 ? "text-green-500" : "text-red-500"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netBalance)}
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
          <p className="text-xs text-muted-foreground">Total spent all time</p>
        </CardContent>
      </Card>
    </div>
  );
}
