
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  session?: any;
}

export function Layout({ children, session }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
