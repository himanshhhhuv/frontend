import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/api/canteen";

const menuSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  unit: z.string().min(1, "Unit is required"),
});

const categories = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
  "FRUITS",
  "BEVERAGES",
  "EXTRAS",
];

export default function Menu() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "menu"],
    queryFn: () => getMenu(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: { unit: "piece", category: "SNACKS" },
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      createMenuItem({ ...data, price: parseFloat(data.price) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "menu"]);
      setShowForm(false);
      reset();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateMenuItem(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries(["admin", "menu"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => queryClient.invalidateQueries(["admin", "menu"]),
  });

  const menuItems = data?.menu || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Menu</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Item name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    {...register("category")}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
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
                  <Label>Unit</Label>
                  <Input
                    placeholder="piece, plate, glass"
                    {...register("unit")}
                  />
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : menuItems.length === 0 ? (
            <p className="text-muted-foreground">No menu items found.</p>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge
                        variant={item.isAvailable ? "default" : "secondary"}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price} per {item.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: item.id,
                          isAvailable: !item.isAvailable,
                        })
                      }
                    >
                      {item.isAvailable ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      Delete
                    </Button>
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
