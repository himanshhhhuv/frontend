import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrders } from "@/api/canteen";

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ["canteen", "orders"],
    queryFn: () => getOrders(),
  });

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Order History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          Order #{order.orderNumber}
                        </p>
                        <Badge>{order.mealType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Student: {order.student?.profile?.name} (
                        {order.student?.profile?.rollNo})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      ₹{order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-muted-foreground"
                          >
                            <span>
                              {item.itemName} x {item.quantity}
                            </span>
                            <span>₹{item.subtotal?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
