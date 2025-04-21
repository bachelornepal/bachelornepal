
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
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
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}
