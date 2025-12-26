import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  Cancel01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMenu, updateMenuItem } from "@/api/canteen";

const categories = [
  { value: "BREAKFAST", label: "Breakfast", emoji: "🍳" },
  { value: "LUNCH", label: "Lunch", emoji: "🍛" },
  { value: "DINNER", label: "Dinner", emoji: "🍽️" },
  { value: "SNACKS", label: "Snacks", emoji: "🍿" },
  { value: "FRUITS", label: "Fruits", emoji: "🍎" },
  { value: "BEVERAGES", label: "Beverages", emoji: "☕" },
  { value: "EXTRAS", label: "Extras", emoji: "🍪" },
];

const getCategoryBadgeVariant = (category) => {
  switch (category) {
    case "BREAKFAST":
      return "default";
    case "LUNCH":
      return "secondary";
    case "DINNER":
      return "default";
    case "SNACKS":
      return "outline";
    case "FRUITS":
      return "secondary";
    case "BEVERAGES":
      return "outline";
    default:
      return "outline";
  }
};

export default function Menu() {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["canteen", "menu"],
    queryFn: () => getMenu(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateMenuItem(id, { isAvailable }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["canteen", "menu"]);
      toast.success(variables.isAvailable ? "Item Enabled" : "Item Disabled", {
        description: `The item is now ${
          variables.isAvailable ? "available" : "unavailable"
        }.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to Update Item", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  // Fix: Access correct data path from API response
  const menuItems = data?.data?.items || data?.menu || data?.items || [];
  const groupedItems = data?.data?.grouped || data?.grouped || {};

  // Filter items by category
  const filteredItems =
    categoryFilter === "ALL"
      ? menuItems
      : menuItems.filter((item) => item.category === categoryFilter);

  // Group items by category for grouped view
  const groupedMenu = categories.reduce((acc, category) => {
    acc[category.value] = menuItems.filter(
      (item) => item.category === category.value
    );
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground">
          View and manage menu item availability.
        </p>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grouped">By Category</TabsTrigger>
          </TabsList>

          {/* Filter (only in list view) */}
          {viewMode === "list" && (
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={FilterIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* List View */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Menu Items{" "}
                {filteredItems.length > 0 && `(${filteredItems.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading menu...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No menu items found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getCategoryBadgeVariant(item.category)}
                          >
                            {categories.find((c) => c.value === item.category)
                              ?.emoji || ""}{" "}
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{item.price}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          per {item.unit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.isAvailable !== false
                                ? "default"
                                : "secondary"
                            }
                          >
                            {item.isAvailable !== false
                              ? "Available"
                              : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: item.id,
                                isAvailable: item.isAvailable === false,
                              })
                            }
                            disabled={toggleMutation.isPending}
                          >
                            <HugeiconsIcon
                              icon={
                                item.isAvailable !== false
                                  ? Cancel01Icon
                                  : Tick02Icon
                              }
                              className="mr-1 h-4 w-4"
                            />
                            {item.isAvailable !== false
                              ? "Disable"
                              : "Enable"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grouped View */}
        <TabsContent value="grouped" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading menu...</p>
            </div>
          ) : Object.keys(groupedMenu).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No menu items found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {categories
                .filter((cat) => groupedMenu[cat.value]?.length > 0)
                .map((category) => (
                  <Card key={category.value}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{category.emoji}</span>
                        {category.label}
                        <Badge variant="secondary" className="ml-auto">
                          {groupedMenu[category.value]?.length || 0} items
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupedMenu[category.value]?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.price} / {item.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  item.isAvailable !== false
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.isAvailable !== false ? "✓" : "✗"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  toggleMutation.mutate({
                                    id: item.id,
                                    isAvailable: item.isAvailable === false,
                                  })
                                }
                                disabled={toggleMutation.isPending}
                              >
                                <HugeiconsIcon
                                  icon={
                                    item.isAvailable !== false
                                      ? Cancel01Icon
                                      : Tick02Icon
                                  }
                                  className="h-4 w-4"
                                />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
