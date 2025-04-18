import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  featured_image: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initializing, setInitializing] = useState(true);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category_id: "",
      featured_image: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");

        if (error) {
          throw error;
        }

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    const fetchPost = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        form.reset({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          category_id: data.category_id || "",
          featured_image: data.featured_image || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          meta_keywords: data.meta_keywords || "",
        });
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
        navigate("/admin/posts");
      }
    };

    const initialize = async () => {
      setInitializing(true);
      await fetchCategories();
      
      if (id) {
        await fetchPost();
      }
      
      setInitializing(false);
    };

    initialize();
  }, [id, navigate, toast, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    if (!id || !form.getValues("slug")) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }

    // Auto-populate meta title if empty
    if (!form.getValues("meta_title")) {
      form.setValue("meta_title", title);
    }
  };

  const onSubmit = async (values: PostFormValues) => {
    setLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error("User not authenticated");
      }

      const slug = values.slug || generateSlug(values.title);

      // Make sure title and slug are always provided
      if (!values.title) {
        throw new Error("Post title is required");
      }

      const postData = {
        title: values.title,
        slug: slug,
        excerpt: values.excerpt,
        content: values.content,
        category_id: values.category_id,
        featured_image: values.featured_image,
        meta_title: values.meta_title || values.title,
        meta_description: values.meta_description || values.excerpt,
        meta_keywords: values.meta_keywords,
        author_id: userData.user.id,
        published_at: new Date().toISOString(),
      };

      let result;
      
      if (id) {
        result = await supabase
          .from("posts")
          .update(postData)
          .eq("id", id);
      } else {
        result = await supabase
          .from("posts")
          .insert(postData)
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: id ? "Post updated" : "Post created",
        description: id ? "Your post has been updated successfully" : "Your post has been created successfully",
      });

      navigate("/admin/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: `Failed to save post: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? "Edit Post" : "Create Post"}
        </h1>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {id ? "Update Post" : "Create Post"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter post title" 
                          {...field}
                          onChange={handleTitleChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="post-url-slug" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly version of the title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief summary of the post" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short description that appears in post listings.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="featured_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          onImageUploaded={(url) => field.onChange(url)}
                          currentImage={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 1200 x 628 pixels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <div className="min-h-[500px] border rounded-lg">
                          <RichTextEditor 
                            value={field.value || ""} 
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <div className="max-w-2xl">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="SEO Title (leave empty to use post title)"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended length: 50-60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description for search engines"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended length: 120-160 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="keyword1, keyword2, keyword3"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </AdminLayout>
  );
};

export default PostForm;
