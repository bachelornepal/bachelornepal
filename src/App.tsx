
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import PostPage from "./pages/PostPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/categories/AdminCategories";
import CategoryForm from "./pages/admin/categories/CategoryForm";
import AdminPosts from "./pages/admin/posts/AdminPosts";
import PostForm from "./pages/admin/posts/PostForm";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/:categorySlug" element={<CategoryPage />} />
              <Route path="/:categorySlug/:postSlug" element={<PostPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected admin routes */}
              <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
              <Route path="/admin/categories" element={<AuthGuard><AdminCategories /></AuthGuard>} />
              <Route path="/admin/categories/new" element={<AuthGuard><CategoryForm /></AuthGuard>} />
              <Route path="/admin/categories/:id" element={<AuthGuard><CategoryForm /></AuthGuard>} />
              <Route path="/admin/posts" element={<AuthGuard><AdminPosts /></AuthGuard>} />
              <Route path="/admin/posts/new" element={<AuthGuard><PostForm /></AuthGuard>} />
              <Route path="/admin/posts/:id" element={<AuthGuard><PostForm /></AuthGuard>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
