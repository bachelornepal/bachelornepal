
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Check if user is admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id);

        if (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Error",
            description: "Could not verify admin status",
            variant: "destructive",
          });
          setIsAdmin(false);
        } else if (data && data.length > 0) {
          console.log("Found profile with admin status:", data[0]?.is_admin);
          // Use first row if exists
          setIsAdmin(data[0]?.is_admin || false);
        } else {
          // No profile found, create one
          console.log("No profile found, creating one with admin status");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              is_admin: true, // Setting new users as admin for development
              username: user.email?.split('@')[0],
              full_name: user.user_metadata.full_name || user.email
            });
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Error",
              description: "Could not create user profile",
              variant: "destructive",
            });
            setIsAdmin(false);
          } else {
            // Successfully created profile with admin status
            console.log("Successfully created profile with admin status");
            setIsAdmin(true);
            toast({
              title: "Success",
              description: "Admin profile created successfully",
            });
          }
        }
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        setIsAdmin(false);
      }
      
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Additional logging for debugging
  console.log("Current path:", location.pathname);
  console.log("Is admin:", isAdmin);
  console.log("Is admin path:", location.pathname.startsWith('/admin'));

  if (isAdmin === false && location.pathname.startsWith('/admin')) {
    // Not an admin, but trying to access admin pages
    toast({
      title: "Access Denied",
      description: "You need admin privileges to access this page",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
