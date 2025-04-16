
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CategoryHeader } from "@/components/CategoryHeader";
import { PostCard } from "@/components/PostCard";
import { useEffect, useState } from "react";
import { Category, Post } from "@/types";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchCategory = async () => {
      try {
        setLoading(true);
        
        // Mock data - would come from Supabase in real implementation
        const mockCategory: Category = {
          id: "1",
          name: categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "Category",
          slug: categorySlug || "",
          description: `Articles and tutorials about ${categorySlug}`,
        };
        
        const mockPosts: Post[] = [
          {
            id: "1",
            title: "Post one",
            slug: "post-one",
            excerpt: "Comprehensive learning materials for Post one",
            content: "Full content for post one",
            category_id: "1",
            author_id: "1",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            title: "Post two",
            slug: "post-two",
            excerpt: "Comprehensive learning materials for Post two",
            content: "Full content for post two",
            category_id: "1",
            author_id: "1",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ];
        
        setCategory(mockCategory);
        setPosts(mockPosts);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (categorySlug) {
      fetchCategory();
    }
  }, [categorySlug]);

  if (loading || !category) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <CategoryHeader category={category} />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} categorySlug={category.slug} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
