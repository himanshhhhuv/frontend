import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMenu } from "@/api/canteen";

const categories = [
  { value: "BREAKFAST", label: "Breakfast", emoji: "🍳" },
  { value: "LUNCH", label: "Lunch", emoji: "🍛" },
  { value: "DINNER", label: "Dinner", emoji: "🍽️" },
  { value: "SNACKS", label: "Snacks", emoji: "🍿" },
  { value: "FRUITS", label: "Fruits", emoji: "🍎" },
  { value: "BEVERAGES", label: "Beverages", emoji: "☕" },
  { value: "EXTRAS", label: "Extras", emoji: "🍪" },
];

export default function Menu() {
  const { data, isLoading } = useQuery({
    queryKey: ["canteen", "menu"],
    queryFn: () => getMenu(),
  });

  // Fix: Access correct data path from API response
  const groupedItems = data?.data?.grouped || data?.grouped || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Canteen Menu</h1>
        <p className="text-muted-foreground">
          Browse available food items and prices.
        </p>
      </div>

      {/* Grouped View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      ) : Object.keys(groupedItems).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No menu items found.</p>
            <p className="text-sm text-muted-foreground">
              Please check back later.
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
