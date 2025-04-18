
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { Category, Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

const PostPage = () => {
  const { categorySlug, postSlug } = useParams<{ categorySlug: string; postSlug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndCategory = async () => {
      if (!categorySlug || !postSlug) return;
      
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
          description: categoryData.description || "",
          created_at: categoryData.created_at,
          updated_at: categoryData.updated_at,
          meta_title: categoryData.meta_title || categoryData.name,
          meta_description: categoryData.meta_description || categoryData.description || `Posts in ${categoryData.name}`,
          meta_keywords: categoryData.meta_keywords || ""
        });
        
        // Then fetch the post
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', postSlug)
          .eq('category_id', categoryData.id)
          .single();
        
        if (postError) {
          throw postError;
        }
        
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post data:", error);
        // Redirect to 404 page after a short delay
        setTimeout(() => {
          navigate('/not-found', { replace: true });
        }, 100);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostAndCategory();
  }, [categorySlug, postSlug, navigate]);

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

  if (!post || !category) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
            <p className="text-muted-foreground">The post you are looking for does not exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Build URL for SEO metadata
  const currentUrl = `${window.location.origin}/${category.slug}/${post.slug}`;

  // Function to safely render post content
  const renderPostContent = () => {
    try {
      // Try to parse content as JSON first (our new format)
      const parsed = JSON.parse(post.content || "[]");
      if (Array.isArray(parsed)) {
        // Convert JSON structure to HTML
        const htmlContent = parsed.map(node => {
          if (!node || !node.type || !node.children) {
            return ''; // Skip invalid nodes
          }
          
          switch (node.type) {
            case 'paragraph':
              return `<p>${node.children.map((c: any) => c.text || '').join('')}</p>`;
            case 'heading-one':
              return `<h1>${node.children.map((c: any) => c.text || '').join('')}</h1>`;
            case 'heading-two':
              return `<h2>${node.children.map((c: any) => c.text || '').join('')}</h2>`;
            case 'heading-three':
              return `<h3>${node.children.map((c: any) => c.text || '').join('')}</h3>`;
            case 'blockquote':
              return `<blockquote>${node.children.map((c: any) => c.text || '').join('')}</blockquote>`;
            case 'bulleted-list':
              const ulItems = node.children.map((item: any) => {
                if (!item || !item.children) return '';
                return `<li>${item.children.map((c: any) => c.text || '').join('')}</li>`;
              }).join('');
              return `<ul>${ulItems}</ul>`;
            case 'numbered-list':
              const olItems = node.children.map((item: any) => {
                if (!item || !item.children) return '';
                return `<li>${item.children.map((c: any) => c.text || '').join('')}</li>`;
              }).join('');
              return `<ol>${olItems}</ol>`;
            default:
              if (node.children && Array.isArray(node.children)) {
                return `<p>${node.children.map((c: any) => c.text || '').join('')}</p>`;
              }
              return '';
          }
        }).join('');
        return htmlContent;
      }
      // Fallback to the content as is
      return post.content || "";
    } catch (e) {
      // If parsing fails, return the content as is
      return post.content || "";
    }
  };

  return (
    <>
      <SEO 
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || `${post.title} - ${category.name}`}
        keywords={post.meta_keywords || category.meta_keywords || ""}
        image={post.featured_image}
        url={currentUrl}
        type="article"
      />
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
              <span>Published on {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
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
              dangerouslySetInnerHTML={{ __html: renderPostContent() }}
            />
          </article>
        </div>
      </Layout>
    </>
  );
};

export default PostPage;
