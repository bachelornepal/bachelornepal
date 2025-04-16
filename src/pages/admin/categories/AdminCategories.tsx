
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch from Supabase
    setCategories([
      { id: "1", name: "Development", slug: "development", description: "Programming tutorials and guides" },
      { id: "2", name: "Design", slug: "design", description: "UI/UX design principles and resources" },
      { id: "3", name: "Business", slug: "business", description: "Business strategies and insights" }
    ]);
  }, []);

  const handleDeleteCategory = (id: string) => {
    // In a real app, delete from Supabase
    setCategories(categories.filter(category => category.id !== id));
    toast({
      title: "Category deleted",
      description: "The category has been deleted successfully."
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <Button asChild>
          <Link to="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Slug: /{category.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/admin/categories/${category.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
