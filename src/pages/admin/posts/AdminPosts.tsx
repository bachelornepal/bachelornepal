
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/types";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PostWithCategory extends Post {
  category_name: string;
  category_slug: string;
}

const AdminPosts = () => {
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch from Supabase
    setPosts([
      {
        id: "1",
        title: "Getting Started with React",
        slug: "getting-started-with-react",
        excerpt: "Learn the basics of React and start building web applications.",
        content: "Full content would go here...",
        category_id: "1",
        category_name: "Development",
        category_slug: "development",
        author_id: "1",
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        title: "UX Design Principles",
        slug: "ux-design-principles",
        excerpt: "Essential UX design principles every designer should know.",
        content: "Full content would go here...",
        category_id: "2",
        category_name: "Design",
        category_slug: "design",
        author_id: "1",
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  const handleDeletePost = (id: string) => {
    // In a real app, delete from Supabase
    setPosts(posts.filter(post => post.id !== id));
    toast({
      title: "Post deleted",
      description: "The post has been deleted successfully."
    });
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
      <div className="grid gap-4">
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
    </AdminLayout>
  );
};

export default AdminPosts;
