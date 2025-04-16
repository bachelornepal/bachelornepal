
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  session?: any;
}

export function Header({ session }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get categories from Supabase
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug');
      
      if (!error && data) {
        setCategories(data);
      } else {
        console.error('Error fetching categories:', error);
        setCategories([
          { name: "Development", slug: "development" },
          { name: "Design", slug: "design" },
          { name: "Business", slug: "business" }
        ]);
      }
    };

    fetchCategories();

    // Check for current user session
    const { data: { user } } = supabase.auth.getUser();
    setUser(user);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold">BachelorNepal</Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            {categories.map((category) => (
              <Link 
                key={category.slug}
                to={`/${category.slug}`} 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/admin")}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Admin
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
