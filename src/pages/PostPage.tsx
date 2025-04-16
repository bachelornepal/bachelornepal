
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { Category, Post } from "@/types";

const PostPage = () => {
  const { categorySlug, postSlug } = useParams<{ categorySlug: string; postSlug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchPostAndCategory = async () => {
      try {
        setLoading(true);
        
        // Mock data - would come from Supabase in real implementation
        const mockCategory: Category = {
          id: "1",
          name: categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "Category",
          slug: categorySlug || "",
          description: `Articles and tutorials about ${categorySlug}`,
        };
        
        const mockPost: Post = {
          id: "1",
          title: postSlug?.replace(/-/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) || "Post",
          slug: postSlug || "",
          content: `
          <p>This is an example blog post content. In a real application, this would be rich text or markdown content stored in the database.</p>
          <p>The content would be much more detailed and might include:</p>
          <ul>
            <li>Formatting like <strong>bold</strong> and <em>italic</em> text</li>
            <li>Code samples</li>
            <li>Images and other media</li>
            <li>Links to other resources</li>
          </ul>
          <p>This is just placeholder text to demonstrate the layout of a blog post page.</p>
          `,
          excerpt: "This is an example blog post excerpt.",
          category_id: "1",
          author_id: "1",
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setCategory(mockCategory);
        setPost(mockPost);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (categorySlug && postSlug) {
      fetchPostAndCategory();
    }
  }, [categorySlug, postSlug]);

  if (loading || !post || !category) {
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
        <Breadcrumb 
          segments={[
            { name: category.name, href: `/${category.slug}` },
            { name: post.title, href: `/${category.slug}/${post.slug}` }
          ]} 
        />
        
        <article className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground mb-8">
            <span>Published on {new Date(post.published_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>Category: {category.name}</span>
          </div>
          
          {post.featured_image && (
            <div className="mb-8">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full h-auto rounded-lg" 
              />
            </div>
          )}
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </Layout>
  );
};

export default PostPage;
