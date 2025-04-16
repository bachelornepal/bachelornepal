
import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: Array<{ name: string; href: string }>;
}

export function Breadcrumb({ segments, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </li>
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              {index === segments.length - 1 ? (
                <span className="font-medium text-foreground">{segment.name}</span>
              ) : (
                <Link
                  to={segment.href}
                  className="hover:text-foreground transition-colors"
                >
                  {segment.name}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
