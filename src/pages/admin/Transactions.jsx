import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  FilterIcon,
  Search01Icon,
  CreditCardIcon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
import { getTransactions } from "@/api/admin";

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: getTransactions,
  });

  const transactions = data?.data?.transactions || [];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
      const matchesSearch =
        searchQuery === "" ||
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.student?.profile?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        tx.student?.profile?.rollNo
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
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

  // Calculate summary stats
  const stats = useMemo(() => {
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
      netAmount: totalCredit - totalDebit,
    };
  }, [transactions]);

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
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all canteen transactions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <HugeiconsIcon
              icon={CreditCardIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <HugeiconsIcon
              icon={MoneyReceive01Icon}
              className="h-4 w-4 text-green-600"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCredit)}
            </div>
            <p className="text-xs text-muted-foreground">Money added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <HugeiconsIcon
              icon={MoneySend01Icon}
              className="h-4 w-4 text-red-600"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDebit)}
            </div>
            <p className="text-xs text-muted-foreground">Money spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <HugeiconsIcon
              icon={stats.netAmount >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
              className={`h-4 w-4 ${
                stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Credit - Debit</p>
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
            placeholder="Search by name, roll no, or description..."
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
              <SelectItem value="CREDIT">Credit Only</SelectItem>
              <SelectItem value="DEBIT">Debit Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transaction History
            {filteredTransactions.length > 0 &&
              ` (${filteredTransactions.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HugeiconsIcon
                icon={CreditCardIcon}
                className="h-12 w-12 text-muted-foreground/50 mb-4"
              />
              <p className="text-muted-foreground">No transactions found.</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || typeFilter !== "ALL"
                  ? "Try adjusting your filters."
                  : "Transactions will appear here once students make purchases."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(tx.date || tx.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {tx.student?.profile?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.student?.profile?.rollNo || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tx.description || "-"}
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
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredTransactions.length)} of{" "}
                    {filteredTransactions.length} entries
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
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
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-4 w-4"
                    />
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
