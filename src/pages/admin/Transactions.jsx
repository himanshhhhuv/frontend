import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTransactions } from "@/api/admin";

export default function Transactions() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: getTransactions,
  });

  const transactions = data?.data?.transactions || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Student: {tx.student?.profile?.name || "Unknown"} (
                      {tx.student?.profile?.rollNo})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === "CREDIT" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}₹
                      {Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={tx.type === "CREDIT" ? "default" : "secondary"}
                    >
                      {tx.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
