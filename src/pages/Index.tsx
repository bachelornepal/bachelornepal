
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Category } from "@/types";

const featuredPosts = [
  {
    id: "1",
    title: "Getting Started with Next.js",
    excerpt: "Learn how to build modern web applications with Next.js",
    slug: "getting-started-with-nextjs",
    category: { name: "Development", slug: "development" }
  },
  {
    id: "2",
    title: "Design Principles Everyone Should Know",
    excerpt: "Essential design principles for developers and designers",
    slug: "design-principles",
    category: { name: "Design", slug: "design" }
  },
  {
    id: "3",
    title: "Building a Business Strategy",
    excerpt: "How to create an effective business strategy for your startup",
    slug: "business-strategy",
    category: { name: "Business", slug: "business" }
  }
];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  // Placeholder categories - in real app would be fetched from Supabase
  useEffect(() => {
    setCategories([
      { id: "1", name: "Development", slug: "development", description: "Programming tutorials and guides" },
      { id: "2", name: "Design", slug: "design", description: "UI/UX design principles and resources" },
      { id: "3", name: "Business", slug: "business", description: "Business strategies and insights" }
    ]);
  }, []);

  return (
    <Layout>
      <section className="bg-primary py-12 md:py-24">
        <div className="container">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to the Blog CMS</h1>
            <p className="text-lg md:text-xl mb-8">
              Discover insightful articles across various categories
            </p>
            <Link
              to="/development"
              className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Explore Posts
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="h-48 bg-primary flex items-center justify-center text-white">
                <span className="text-xl font-semibold">{post.title}</span>
              </div>
              <CardContent className="p-6">
                <Link 
                  to={`/${post.category.slug}/${post.slug}`}
                  className="text-xl font-bold hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
                <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4">
                  <Link 
                    to={`/${post.category.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {post.category.name}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-12 border-t">
        <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
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
      </section>
    </Layout>
  );
};

export default Index;
