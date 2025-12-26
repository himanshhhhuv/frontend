import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  ShoppingCart,
  Trash2,
  User,
  Wallet,
  Minus,
  Plus,
  Utensils,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

// API Imports
import { getMenu, quickBilling, lookupStudent } from "@/api/canteen";

export default function BillingPOS() {
  // --- State ---
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [cart, setCart] = useState([]);
  const [mealType, setMealType] = useState("LUNCH");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // --- Queries ---
  const { data: menuData } = useQuery({
    queryKey: ["canteen", "menu"],
    queryFn: () => getMenu(),
  });

  // --- Mutations ---
  const lookupMutation = useMutation({
    mutationFn: () => lookupStudent(rollNo),
    onSuccess: (data) => {
      setStudent(data.student);
      setStatusMsg(null);
    },
    onError: (err) => {
      setStudent(null);
      const errorMessage =
        err.response?.data?.message || "Student not found or invalid ID.";
      setStatusMsg({ type: "error", text: errorMessage });
    },
  });

  const billingMutation = useMutation({
    mutationFn: () =>
      quickBilling(
        rollNo,
        cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        mealType
      ),
    onSuccess: (data) => {
      toast.success("Order Successful", {
        description: `Order #${data.order?.orderNumber} has been processed.`,
      });
      setStatusMsg({
        type: "success",
        text: `Order #${data.order?.orderNumber} Success!`,
      });
      // Reset for next customer
      setCart([]);
      setStudent(null);
      setRollNo("");
      // Auto-clear success message after 3 seconds
      setTimeout(() => setStatusMsg(null), 3000);
    },
    onError: (err) => {
      toast.error("Transaction Failed", {
        description: err.response?.data?.message || "Unable to process order.",
      });
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Transaction Failed",
      });
    },
  });

  // --- Helpers ---
  const menuItems = useMemo(() => {
    return menuData?.data?.items || menuData?.menu || menuData?.items || [];
  }, [menuData]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

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

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // --- Categories extraction for filter chips ---
  const categories = ["ALL", ...new Set(menuItems.map((i) => i.category))];

  return (
    <Card className="h-full w-full  flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT PANEL: Customer & Cart (Fixed width) */}
      <aside className="w-full lg:w-[420px] xl:w-[480px] bg-card  flex flex-col h-full  z-10">
        {/* 1. Header & Student Lookup */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-card">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5" /> Canteen POS
          </h2>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan Roll No / ID Card"
                className="pl-9 bg-background"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupMutation.mutate()}
                autoFocus
              />
            </div>
            <Button
              onClick={() => lookupMutation.mutate()}
              disabled={lookupMutation.isPending || !rollNo.trim()}
              size="default"
              className="shrink-0"
            >
              {lookupMutation.isPending ? "..." : "Find"}
            </Button>
          </div>

          {/* Student Profile Card */}
          {student ? (
            <div className="bg-accent/50 p-3 sm:p-4 rounded-lg border  animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1 truncate">
                    {student.profile?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {student.profile?.rollNo}
                  </p>
                </div>
                <Badge
                  variant={
                    student.walletBalance < 50 ? "destructive" : "default"
                  }
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 flex items-center gap-1.5 font-semibold shrink-0 ${
                    student.walletBalance < 50
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> ₹
                  {student.walletBalance || 0}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="h-20 sm:h-24 flex flex-col items-center justify-center text-muted-foreground text-xs sm:text-sm border-2 border-dashed border-border rounded-lg bg-muted/30">
              <User className="w-5 h-5 sm:w-6 sm:h-6 mb-2 opacity-50" />
              <p>No student selected</p>
            </div>
          )}

          {/* Status Message Area */}
          {statusMsg && (
            <div
              className={`p-3 text-xs sm:text-sm rounded-lg font-medium flex items-start gap-2 shadow-sm ${
                statusMsg.type === "success"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="flex-1 text-left">{statusMsg.text}</span>
              <button
                onClick={() => setStatusMsg(null)}
                className="shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Cart Items (Scrollable) */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-muted-foreground opacity-50">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 opacity-30" />
              <p className="font-medium text-sm sm:text-base">Cart is empty</p>
              <p className="text-xs mt-1">Add items from the menu</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{item.price} / {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <span className="font-bold w-6 sm:w-8 text-center text-foreground text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <p className="font-bold text-foreground text-sm sm:text-base">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, -item.quantity)}
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* 3. Checkout Footer (Fixed) */}
        <div className="p-3 sm:p-4 border-t border-border bg-card space-y-3 sm:space-y-4 ">
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-base sm:text-lg font-semibold text-foreground">
              Total Payable
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              ₹{cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Meal Type
              </label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREAKFAST">🍳 Breakfast</SelectItem>
                  <SelectItem value="LUNCH">🍛 Lunch</SelectItem>
                  <SelectItem value="EVENING_SNACKS">🍿 Snacks</SelectItem>
                  <SelectItem value="DINNER">🍽️ Dinner</SelectItem>
                  <SelectItem value="OTHER">🍴 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 font-bold text-primary-foreground  hover:shadow-xl transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base"
              disabled={
                !student || cart.length === 0 || billingMutation.isPending
              }
              onClick={() => billingMutation.mutate()}
            >
              {billingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">CONFIRM & PAY </span>
                  <span className="sm:hidden">PAY </span>₹{cartTotal.toFixed(2)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: Menu Grid */}
      <main className="flex-1 flex flex-col h-full overflow-hidden ">
        {/* Menu Header & Search */}
        <header className="p-3 sm:p-4 bg-card  flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center sticky top-0 z-10">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          <ScrollArea className="w-full sm:w-auto">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-accent transition-all duration-200 font-medium text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                      : "bg-background text-foreground hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </header>

        {/* Menu Grid */}
        <ScrollArea className="flex-1 p-3 sm:p-4 rounded-lg bg-muted/40 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group relative transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-card border-border hover:border-primary/50 active:scale-[0.98]"
                onClick={() => addToCart(item)}
              >
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs font-normal text-muted-foreground bg-secondary"
                    >
                      {item.category}
                    </Badge>
                    <span className="font-bold text-base sm:text-lg text-primary whitespace-nowrap">
                      ₹{item.price}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 pb-3 sm:pb-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 min-h-10 mb-2 text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      per {item.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 sm:py-16 text-center">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/30 mb-3 sm:mb-4" />
                <p className="text-foreground font-medium text-sm sm:text-base">
                  No items found
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </Card>
  );
}
