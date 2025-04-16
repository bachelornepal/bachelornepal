
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error, data } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      } else {
        // Check admin status after successful login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data?.user?.id);

        if (profileError) {
          console.error("Error checking profile:", profileError);
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        console.log("Login successful, redirecting to:", from);
        console.log("Profile data:", profileData);
        
        // Force a longer delay to ensure the auth state and profile data propagates
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6">
          <Link to="/" className="text-sm text-primary hover:underline">
            &larr; Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
