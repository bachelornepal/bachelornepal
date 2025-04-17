
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/types";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostWithCategory extends Post {
  category_name: string;
  category_slug: string;
}

const AdminPosts = () => {
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:category_id (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      const formattedPosts: PostWithCategory[] = data.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        category_id: post.category_id || "",
        category_name: post.categories?.name || "Uncategorized",
        category_slug: post.categories?.slug || "uncategorized",
        author_id: post.author_id || "",
        published_at: post.published_at || new Date().toISOString(),
        created_at: post.created_at,
        featured_image: post.featured_image || "",
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Button asChild>
          <Link to="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12">
          <p className="text-muted-foreground mb-4">No posts found</p>
          <Button asChild>
            <Link to="/admin/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create your first post
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Category: {post.category_name}</span>
                      <span>Published: {formatDate(post.published_at)}</span>
                      <span>
                        URL: /{post.category_slug}/{post.slug}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/admin/posts/${post.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeletePost(post.id)}
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
      )}
    </AdminLayout>
  );
};

export default AdminPosts;
