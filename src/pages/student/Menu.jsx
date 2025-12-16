import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMenu } from "@/api/canteen";

const categories = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
  "BEVERAGES",
  "EXTRAS",
];

export default function Menu() {
  const { data, isLoading } = useQuery({
    queryKey: ["canteen", "menu"],
    queryFn: () => getMenu(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading menu...</div>;
  }

  const menuItems = data?.menu || [];

  const groupedMenu = categories.reduce((acc, category) => {
    acc[category] = menuItems.filter((item) => item.category === category);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Canteen Menu</h1>

      {categories.map((category) => {
        const items = groupedMenu[category];
        if (!items || items.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        per {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price}</p>
                      <Badge
                        variant={item.isAvailable ? "default" : "secondary"}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
