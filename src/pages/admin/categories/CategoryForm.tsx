
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface FormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (isEditMode) {
      // In a real app, fetch from Supabase
      const mockCategories: Record<string, Category> = {
        "1": { 
          id: "1", 
          name: "Development", 
          slug: "development", 
          description: "Programming tutorials and guides" 
        },
        "2": { 
          id: "2", 
          name: "Design", 
          slug: "design", 
          description: "UI/UX design principles and resources" 
        },
        "3": { 
          id: "3", 
          name: "Business", 
          slug: "business", 
          description: "Business strategies and insights" 
        },
      };
      
      if (id && mockCategories[id]) {
        const category = mockCategories[id];
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description,
          image_url: category.image_url || "",
        });
      }
    }
  }, [isEditMode, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      name: value,
      // Auto-generate slug from name if user hasn't manually edited the slug
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/\s+/g, "-") 
        ? value.toLowerCase().replace(/\s+/g, "-")
        : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, save to Supabase
      toast({
        title: isEditMode ? "Category updated" : "Category created",
        description: `The category "${formData.name}" has been ${isEditMode ? "updated" : "created"} successfully.`
      });
      navigate("/admin/categories");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the category.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          {isEditMode ? "Edit Category" : "New Category"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              The URL-friendly version of the name. Will be used in the URL: /{formData.slug}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              {isEditMode ? "Update" : "Create"} Category
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/categories")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;
