import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Tick02Icon,
  Cancel01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/api/canteen";

const menuSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  unit: z.string().min(1, "Unit is required"),
});

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
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "menu"],
    queryFn: () => getMenu(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: { unit: "piece", category: "SNACKS" },
  });

  const createMutation = useMutation({
    mutationFn: (formData) =>
      createMenuItem({ ...formData, price: parseFloat(formData.price) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "menu"]);
      setShowForm(false);
      reset();
      toast.success("Menu Item Added", {
        description: "The new item has been added to the menu.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Add Item", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateMenuItem(id, { isAvailable }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["admin", "menu"]);
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

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "menu"]);
      toast.success("Item Deleted", {
        description: "The menu item has been removed.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Delete Item", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  // Fix: Access correct data path from API response
  const menuItems = data?.data?.items || data?.items || [];
  const groupedItems = data?.data?.grouped || data?.grouped || {};

  // Filter items by category
  const filteredItems =
    categoryFilter === "ALL"
      ? menuItems
      : menuItems.filter((item) => item.category === categoryFilter);

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Menu</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage canteen menu items.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {/* Create Menu Item Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Masala Dosa"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.emoji} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="plate">Plate</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="bowl">Bowl</SelectItem>
                          <SelectItem value="cup">Cup</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="500g">500g</SelectItem>
                          <SelectItem value="250g">250g</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unit && (
                    <p className="text-sm text-destructive">
                      {errors.unit.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <p className="text-sm text-muted-foreground">
                    Add a new item to get started.
                  </p>
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
                          <div className="flex justify-end gap-2">
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
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={deleteMutation.isPending}
                                  />
                                }
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  className="h-4 w-4"
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Menu Item
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong>{item.name}</strong>? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={() =>
                                      deleteMutation.mutate(item.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
          ) : Object.keys(groupedItems).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No menu items found.</p>
                <p className="text-sm text-muted-foreground">
                  Add a new item to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {categories
                .filter((cat) => groupedItems[cat.value]?.length > 0)
                .map((category) => (
                  <Card key={category.value}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{category.emoji}</span>
                        {category.label}
                        <Badge variant="secondary" className="ml-auto">
                          {groupedItems[category.value]?.length || 0} items
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupedItems[category.value]?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
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
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                    />
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={Delete02Icon}
                                    className="h-4 w-4 text-destructive"
                                  />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Menu Item
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{item.name}</strong>?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() =>
                                        deleteMutation.mutate(item.id)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
