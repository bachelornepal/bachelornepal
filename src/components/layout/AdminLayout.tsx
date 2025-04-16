
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, FolderOpen, Home, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const { toast } = useToast();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/posts", label: "Posts", icon: BookOpen },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/profile", label: "Profile", icon: User },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <span>Blog Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                // In real app, would call signOut() from Supabase here
                toast({
                  title: "Signed out successfully",
                });
                window.location.href = "/";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <Link to="/" className="lg:hidden">
            <Home className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
            <h1 className="font-semibold">Admin Panel</h1>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
