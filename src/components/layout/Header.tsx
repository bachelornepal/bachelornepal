
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Pencil, LogIn } from "lucide-react";
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
          { name: "BCA", slug: "bca" },
          { name: "BIM", slug: "bim" },
          { name: "CSIT", slug: "csit" }
        ]);
      }
    };

    fetchCategories();

    // Check for current user session
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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
            <div className="relative group">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Courses
              </span>
              <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link 
                    key={category.slug}
                    to={`/${category.slug}`} 
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/about-us" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </Link>
            <Link to="/contact-us" className="text-sm font-medium transition-colors hover:text-primary">
              Contact Us
            </Link>
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
              Pages
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
