
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Category, Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface FeaturedPost extends Post {
  categories: {
    name: string;
    slug: string;
  };
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch featured posts (most recent 3)
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            categories:category_id (
              name,
              slug
            )
          `)
          .order('published_at', { ascending: false })
          .limit(3);
          
        if (postsError) throw postsError;
        
        setCategories(categoriesData as Category[]);
        setFeaturedPosts(postsData as FeaturedPost[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const siteTitle = "Blog CMS";
  const siteDescription = "Discover insightful articles across various categories";

  return (
    <Layout>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
      </Helmet>

      <section className="bg-primary py-12 md:py-24">
        <div className="container">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{siteTitle}</h1>
            <p className="text-lg md:text-xl mb-8">
              {siteDescription}
            </p>
            {categories.length > 0 && (
              <Link
                to={`/${categories[0].slug}`}
                className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
              >
                Explore Posts
              </Link>
            )}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="container py-12">
            <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
            {featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    {post.featured_image ? (
                      <div 
                        className="h-48 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${post.featured_image})` }}
                      />
                    ) : (
                      <div className="h-48 bg-primary flex items-center justify-center text-white">
                        <span className="text-xl font-semibold">{post.title}</span>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <Link 
                        to={`/${post.categories?.slug || 'uncategorized'}/${post.slug}`}
                        className="text-xl font-bold hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-4">
                        <Link 
                          to={`/${post.categories?.slug || 'uncategorized'}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {post.categories?.name || 'Uncategorized'}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No featured posts available</p>
            )}
          </section>

          <section className="container py-12 border-t">
            <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} to={`/${category.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        <p className="mt-2 text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No categories available</p>
            )}
          </section>
        </>
      )}
    </Layout>
  );
};

export default Index;
