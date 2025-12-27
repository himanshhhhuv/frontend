import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  FilterIcon,
  Search01Icon,
  Wallet01Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getWallet } from "@/api/student";

// Transaction Details Dialog Component
function TransactionDetailsDialog({ transaction }) {
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

  const hasFoodOrder = transaction?.foodOrder && Object.keys(transaction.foodOrder).length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Transaction Details
            {hasFoodOrder && ` - Order #${transaction.foodOrder.orderNumber}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Transaction Type
              </p>
              <Badge
                variant={transaction.type === "CREDIT" ? "default" : "secondary"}
                className={`mt-1 ${
                  transaction.type === "CREDIT"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                <HugeiconsIcon
                  icon={
                    transaction.type === "CREDIT"
                      ? ArrowDown01Icon
                      : ArrowUp01Icon
                  }
                  className="mr-1 h-3 w-3"
                />
                {transaction.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  transaction.type === "CREDIT"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "CREDIT" ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date & Time
              </p>
              <p className="mt-1">{formatDate(transaction.date || transaction.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="mt-1">{transaction.description || "No description"}</p>
            </div>
          </div>

          {/* Food Order Details */}
          {hasFoodOrder && (
            <>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Food Order Details
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order Number</p>
                    <p className="font-medium">{transaction.foodOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meal Type</p>
                    <Badge variant="secondary" className="mt-1 gap-1">
                      <span>
                        {getMealTypeEmoji(transaction.foodOrder.mealType)}
                      </span>
                      {transaction.foodOrder.mealType}
                    </Badge>
                  </div>
                  {transaction.foodOrder.servedBy && (
                    <div>
                      <p className="text-xs text-muted-foreground">Served By</p>
                      <p className="font-medium">
                        {transaction.foodOrder.servedBy.profile?.name || "Unknown"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Items Purchased
                  </p>
                  <div className="border rounded-lg divide-y">
                    {transaction.foodOrder.items?.map((item, idx) => (
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

                {/* Order Total */}
                <div className="flex justify-between items-center pt-4 border-t mt-4">
                  <p className="text-lg font-bold">Order Total</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(transaction.foodOrder.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Wallet() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const { data, isLoading } = useQuery({
    queryKey: ["student", "wallet"],
    queryFn: getWallet,
  });

  const wallet = data?.data || {
    balance: 0,
    recentTransactions: [],
    stats: {},
  };
  const transactions = wallet.recentTransactions || [];
  const apiStats = wallet.stats || {};

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
      const matchesSearch =
        searchQuery === "" ||
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchQuery]);

  // Pagination
  const itemsPerPage = parseInt(pageSize);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (value) => {
    setTypeFilter(value);
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

  // Use API stats or calculate from transactions
  const stats = useMemo(() => {
    // If API provides stats, use them
    if (apiStats.totalCredits !== undefined) {
      return {
        totalTransactions: apiStats.totalTransactions || 0,
        totalCredit: apiStats.totalCredits || 0,
        totalDebit: apiStats.totalDebits || 0,
        creditCount: apiStats.creditCount || 0,
        debitCount: apiStats.debitCount || 0,
      };
    }
    // Fallback to calculating from transactions
    const totalCredit = transactions
      .filter((tx) => tx.type === "CREDIT")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebit = transactions
      .filter((tx) => tx.type === "DEBIT")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      totalTransactions: transactions.length,
      totalCredit,
      totalDebit,
      creditCount: transactions.filter((tx) => tx.type === "CREDIT").length,
      debitCount: transactions.filter((tx) => tx.type === "DEBIT").length,
    };
  }, [transactions, apiStats]);

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

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">
          View your balance and transaction history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Current Balance - Highlighted */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <HugeiconsIcon
                icon={Wallet01Icon}
                className="h-5 w-5 text-primary"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-4xl font-bold text-primary">
                  {formatCurrency(wallet.balance || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalTransactions} transactions ({stats.creditCount}{" "}
                  credits, {stats.debitCount} debits)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Added</CardTitle>
            <HugeiconsIcon
              icon={MoneyReceive01Icon}
              className="h-4 w-4 text-green-600"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalCredit)}
                </div>
                <p className="text-xs text-muted-foreground">Money credited</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <HugeiconsIcon
              icon={MoneySend01Icon}
              className="h-4 w-4 text-red-600"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalDebit)}
                </div>
                <p className="text-xs text-muted-foreground">Money spent</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={FilterIcon}
            className="h-4 w-4 text-muted-foreground"
          />
          <Select value={typeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CREDIT">Credits Only</SelectItem>
              <SelectItem value="DEBIT">Debits Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5" />
            Transaction History
            {filteredTransactions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredTransactions.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Your complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  className="h-8 w-8 text-muted-foreground"
                />
              </div>
              <h3 className="text-lg font-semibold">No transactions found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {searchQuery || typeFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria."
                  : "Your transactions will appear here once you start using your wallet."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(tx.date || tx.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="truncate font-medium">
                            {tx.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "CREDIT" ? "default" : "secondary"
                            }
                            className={
                              tx.type === "CREDIT"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                            }
                          >
                            <HugeiconsIcon
                              icon={
                                tx.type === "CREDIT"
                                  ? ArrowDown01Icon
                                  : ArrowUp01Icon
                              }
                              className="mr-1 h-3 w-3"
                            />
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-bold ${
                              tx.type === "CREDIT"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "CREDIT" ? "+" : "-"}
                            {formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <TransactionDetailsDialog transaction={tx} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {tx.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date || tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                      <p
                        className={`font-bold ${
                          tx.type === "CREDIT"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "CREDIT" ? "+" : "-"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={tx.type === "CREDIT" ? "default" : "secondary"}
                          className={`text-xs ${
                            tx.type === "CREDIT"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                        <TransactionDetailsDialog transaction={tx} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Show</span>
                    <Select
                      value={pageSize}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>per page</span>
                    <span className="ml-4 hidden sm:inline">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredTransactions.length)} of{" "}
                      {filteredTransactions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        className="h-4 w-4"
                      />
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
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
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
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only sm:not-sr-only sm:mr-1">
                        Next
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
