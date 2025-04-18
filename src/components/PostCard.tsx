
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Post } from "@/types";

interface PostCardProps {
  post: Post;
  categorySlug: string;
}

export function PostCard({ post, categorySlug }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full aspect-[1200/628] bg-primary">
        {post.featured_image ? (
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="absolute w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-xl font-semibold">
            {post.title}
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold">{post.title}</h3>
        <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link 
          to={`/${categorySlug}/${post.slug}`} 
          className="flex items-center text-primary hover:underline"
        >
          Explore Semester <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
