
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="text-xl font-bold">Blog CMS</Link>
            <p className="mt-2 text-sm text-muted-foreground">
              A modern blog platform built with React and Supabase
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <nav className="flex flex-col space-y-2">
              <h3 className="font-medium">Pages</h3>
              <Link to="/" className="text-sm hover:underline">Home</Link>
              <Link to="/development" className="text-sm hover:underline">Development</Link>
              <Link to="/design" className="text-sm hover:underline">Design</Link>
            </nav>
            <nav className="flex flex-col space-y-2">
              <h3 className="font-medium">Admin</h3>
              <Link to="/admin" className="text-sm hover:underline">Dashboard</Link>
              <Link to="/admin/posts" className="text-sm hover:underline">Posts</Link>
              <Link to="/admin/categories" className="text-sm hover:underline">Categories</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Blog CMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
