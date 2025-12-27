import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  // FilterIcon,
  // Search01Icon,
  // ShoppingCartIcon,
  // ArrowLeft01Icon,
  // ArrowRight01Icon,
  // CalendarIcon,
  // MoneyReceive01Icon,
  // ReceiptIcon,
  // UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOrders } from "@/api/canteen";

// Order Details Dialog Component
function OrderDetailsDialog({ order }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getMealTypeEmoji = (mealType) => {
    const emojis = {
      BREAKFAST: "🍳",
      LUNCH: "🍛",
      EVENING_SNACKS: "🍿",
      DINNER: "🍽️",
      OTHER: "🍴",
    };
    return emojis[mealType] || "🍴";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Student
              </p>
              <div className="flex items-center gap-2 mt-1">
                {/* <HugeiconsIcon
                  icon={UserIcon}
                  className="h-4 w-4 text-muted-foreground"
                /> */}
                <div>
                  <p className="font-medium">
                    {order.student?.profile?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.student?.profile?.rollNo || "-"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Meal Type
              </p>
              <Badge variant="secondary" className="mt-1 gap-1">
                <span>{getMealTypeEmoji(order.mealType)}</span>
                {order.mealType}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date & Time
              </p>
              <p className="mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Served By
              </p>
              <p className="mt-1">
                {order.servedBy?.profile?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Order Items
            </p>
            <div className="border rounded-lg divide-y">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-lg font-bold">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(order.totalAmount || 0)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Orders() {
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("20");

  const { data, isLoading } = useQuery({
    queryKey: ["canteen", "orders", currentPage, pageSize, mealTypeFilter],
    queryFn: () =>
      getOrders({
        page: currentPage,
        limit: parseInt(pageSize),
        mealType: mealTypeFilter !== "ALL" ? mealTypeFilter : undefined,
      }),
  });

  const orders = useMemo(() => data?.data?.orders || [], [data?.data?.orders]);
  const pagination = useMemo(
    () =>
      data?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    [data?.data?.pagination]
  );

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(query) ||
        order.student?.profile?.name?.toLowerCase().includes(query) ||
        order.student?.profile?.rollNo?.toLowerCase().includes(query) ||
        order.items?.some((item) =>
          item.itemName?.toLowerCase().includes(query)
        )
    );
  }, [orders, searchQuery]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
    };
  }, [orders]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getMealTypeEmoji = (mealType) => {
    const emojis = {
      BREAKFAST: "🍳",
      LUNCH: "🍛",
      EVENING_SNACKS: "🍿",
      DINNER: "🍽️",
      OTHER: "🍴",
    };
    return emojis[mealType] || "🍴";
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleFilterChange = (value) => {
    setMealTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all food orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            {/* <HugeiconsIcon
              icon={ShoppingCartIcon}
              className="h-4 w-4 text-muted-foreground"
            /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Orders
            </CardTitle>
            {/* <HugeiconsIcon
              icon={CalendarIcon}
              className="h-4 w-4 text-blue-600"
            /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.todayOrders}
            </div>
            <p className="text-xs text-muted-foreground">Orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            {/* <HugeiconsIcon
              icon={MoneyReceive01Icon}
              className="h-4 w-4 text-green-600"
            /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            {/* <HugeiconsIcon
              icon={ReceiptIcon}
              className="h-4 w-4 text-purple-600"
            /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Revenue today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          {/* <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          /> */}
          <Input
            placeholder="Search by order number, student name, roll no, or items..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* <HugeiconsIcon
            icon={FilterIcon}
            className="h-4 w-4 text-muted-foreground"
          /> */}
          <Select value={mealTypeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All meal types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Meal Types</SelectItem>
              <SelectItem value="BREAKFAST">🍳 Breakfast</SelectItem>
              <SelectItem value="LUNCH">🍛 Lunch</SelectItem>
              <SelectItem value="EVENING_SNACKS">🍿 Snacks</SelectItem>
              <SelectItem value="DINNER">🍽️ Dinner</SelectItem>
              <SelectItem value="OTHER">🍴 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Order History
            {filteredOrders.length > 0 && ` (${pagination.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {/* <HugeiconsIcon
                icon={ShoppingCartIcon}
                className="h-12 w-12 text-muted-foreground/50 mb-4"
              /> */}
              <p className="text-muted-foreground">No orders found.</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || mealTypeFilter !== "ALL"
                  ? "Try adjusting your filters."
                  : "Orders will appear here once they are placed."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.student?.profile?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.student?.profile?.rollNo || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <span>{getMealTypeEmoji(order.mealType)}</span>
                          {order.mealType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.items
                              ?.slice(0, 2)
                              .map((item) => item.itemName)
                              .join(", ")}
                            {order.items?.length > 2 && "..."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-green-600">
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderDetailsDialog order={order} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Show</span>
                  <Select value={pageSize} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                  <span className="ml-4">
                    Showing {(currentPage - 1) * parseInt(pageSize) + 1} to{" "}
                    {Math.min(
                      currentPage * parseInt(pageSize),
                      pagination.total
                    )}{" "}
                    of {pagination.total} entries
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {/* <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" /> */}
                    <span className="sr-only sm:not-sr-only sm:ml-1">
                      Previous
                    </span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                  >
                    <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                    {/* <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-4 w-4"
                    /> */}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
