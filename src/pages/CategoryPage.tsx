
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CategoryHeader } from "@/components/CategoryHeader";
import { PostCard } from "@/components/PostCard";
import { useEffect, useState } from "react";
import { Category, Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        
        // First fetch the category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
        
        if (categoryError) {
          throw categoryError;
        }

        setCategory({
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || ""
        });
        
        // Then fetch posts for this category
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('published_at', { ascending: false });
        
        if (postsError) {
          throw postsError;
        }
        
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndPosts();
  }, [categorySlug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
            <p className="text-muted-foreground">The category you are looking for does not exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <CategoryHeader category={category} />
        
        {posts.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} categorySlug={category.slug} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex justify-center">
            <p className="text-muted-foreground">No posts found in this category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
