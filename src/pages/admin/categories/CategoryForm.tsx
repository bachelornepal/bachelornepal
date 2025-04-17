
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id && id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditMode) return;

      try {
        setInitializing(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            // Since image_url doesn't exist in the database, we'll use an empty string
            image_url: "",
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || ""
          });
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        });
        navigate("/admin/categories");
      } finally {
        setInitializing(false);
      }
    };

    fetchCategory();
    if (!isEditMode) {
      setInitializing(false);
    }
  }, [isEditMode, id, navigate, toast]);

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
        ? value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
        : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!formData.name || !formData.slug) {
        throw new Error("Name and slug are required");
      }

      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        // We won't send image_url to Supabase since it doesn't have this column
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords
      };

      let result;
      
      if (isEditMode) {
        result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('categories')
          .insert(categoryData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: isEditMode ? "Category updated" : "Category created",
        description: `The category "${formData.name}" has been ${isEditMode ? "updated" : "created"} successfully.`
      });
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: `There was a problem saving the category: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
          
          <div className="pt-4 border-t">
            <h2 className="text-lg font-medium mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="SEO Title (leave empty to use category name)"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended length: 50-60 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Brief description for search engines"
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended length: 120-160 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated keywords
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update" : "Create"} Category
                </>
              )}
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
