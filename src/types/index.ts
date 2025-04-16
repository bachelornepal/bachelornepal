
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: string;
  author_id: string;
  published_at: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}
