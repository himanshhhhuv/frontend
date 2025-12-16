import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWallet } from "@/api/student";

export default function Wallet() {
  const { data, isLoading } = useQuery({
    queryKey: ["student", "wallet"],
    queryFn: getWallet,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading wallet...</div>;
  }

  const wallet = data?.data || { balance: 0, transactions: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            ₹{wallet.balance?.toFixed(2) || "0.00"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.transactions?.length === 0 ? (
            <p className="text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="space-y-3">
              {wallet.transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
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
