
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  session?: any;
}

export function Header({ session }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  // Placeholder categories - in real app would be fetched from Supabase
  useEffect(() => {
    setCategories([
      { name: "Development", slug: "development" },
      { name: "Design", slug: "design" },
      { name: "Business", slug: "business" }
    ]);
  }, []);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold">Blog CMS</Link>
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
          {session ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/admin")}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Admin
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  // In real app, would call signOut() from Supabase here
                  toast({
                    title: "Signed out successfully",
                  });
                  navigate("/");
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
