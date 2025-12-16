import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getMenu, quickBilling, lookupStudent } from "@/api/canteen";

export default function Billing() {
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [cart, setCart] = useState([]);
  const [mealType, setMealType] = useState("OTHER");
  const [message, setMessage] = useState({ type: "", text: "" });

  const { data: menuData } = useQuery({
    queryKey: ["canteen", "menu"],
    queryFn: () => getMenu(),
  });

  const lookupMutation = useMutation({
    mutationFn: () => lookupStudent(rollNo),
    onSuccess: (data) => {
      setStudent(data.student);
      setMessage({ type: "", text: "" });
    },
    onError: (err) => {
      setStudent(null);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Student not found",
      });
    },
  });

  const billingMutation = useMutation({
    mutationFn: () =>
      quickBilling(
        rollNo,
        cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        mealType
      ),
    onSuccess: (data) => {
      setMessage({
        type: "success",
        text: `Order #${data.order?.orderNumber} created successfully!`,
      });
      setCart([]);
      setStudent(null);
      setRollNo("");
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Billing failed",
      });
    },
  });

  const menuItems = menuData?.menu?.filter((item) => item.isAvailable) || [];

  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map((c) => (c.id === itemId ? { ...c, quantity } : c)));
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quick Billing</h1>

      {message.text && (
        <div
          className={`p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Lookup */}
        <Card>
          <CardHeader>
            <CardTitle>Student Lookup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter roll number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
              <Button
                onClick={() => lookupMutation.mutate()}
                disabled={!rollNo || lookupMutation.isPending}
              >
                {lookupMutation.isPending ? "..." : "Lookup"}
              </Button>
            </div>
            {student && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">{student.profile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Roll: {student.profile?.rollNo}
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance: ₹{student.walletBalance || 0}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-muted-foreground">No items in cart</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-lg font-bold">
                    Total: ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Meal Type</Label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="EVENING_SNACKS">Evening Snacks</option>
                <option value="DINNER">Dinner</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Button
              className="w-full"
              onClick={() => billingMutation.mutate()}
              disabled={
                !student || cart.length === 0 || billingMutation.isPending
              }
            >
              {billingMutation.isPending
                ? "Processing..."
                : `Bill ₹${totalAmount.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => addToCart(item)}
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <p className="font-bold">₹{item.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
