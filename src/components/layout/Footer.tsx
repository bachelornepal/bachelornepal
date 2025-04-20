
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="text-xl font-bold">BachelorNepal</Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your comprehensive guide to bachelor's degrees in Nepal
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <nav className="flex flex-col space-y-2">
              <h3 className="font-medium">Courses</h3>
              <Link to="/bca" className="text-sm hover:underline">BCA</Link>
              <Link to="/bim" className="text-sm hover:underline">BIM</Link>
              <Link to="/csit" className="text-sm hover:underline">CSIT</Link>
            </nav>
            <nav className="flex flex-col space-y-2">
              <h3 className="font-medium">Pages</h3>
              <Link to="/about-us" className="text-sm hover:underline">About Us</Link>
              <Link to="/contact-us" className="text-sm hover:underline">Contact Us</Link>
              <Link to="/privacy-policy" className="text-sm hover:underline">Privacy Policy</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BachelorNepal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
