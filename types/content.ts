export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentType = 'blog' | 'tutorial' | 'review' | 'news';
export type VideoProvider = 'youtube' | 'instagram' | 'tiktok' | 'vimeo';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string; // hex color for UI
  icon?: string;
  postCount: number;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: number;
}

export interface VideoEmbed {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  title?: string;
  duration?: number; // seconds
  width?: number;
  height?: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string; // sanitized HTML or markdown
  contentType: 'html' | 'markdown';
  author: string; // userId
  authorName?: string;
  featuredImage?: string;
  status: ContentStatus;
  type: ContentType;
  categories: string[]; // category IDs
  tags: string[]; // tag IDs
  videoEmbed?: VideoEmbed;
  readTime?: number; // minutes
  viewCount: number;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface CreatePostInput {
  title: string;
  excerpt?: string;
  content: string;
  contentType?: 'html' | 'markdown';
  featuredImage?: string;
  status?: ContentStatus;
  type?: ContentType;
  categories?: string[];
  tags?: string[];
  videoEmbed?: Omit<VideoEmbed, 'embedUrl' | 'thumbnailUrl'> & { url?: string }; // accepts raw URL
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdatePostInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  contentType?: 'html' | 'markdown';
  featuredImage?: string;
  status?: ContentStatus;
  type?: ContentType;
  categories?: string[];
  tags?: string[];
  videoEmbed?: VideoEmbed;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ContentListQuery {
  status?: ContentStatus;
  type?: ContentType;
  category?: string; // slug
  tag?: string; // slug
  author?: string; // userId
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'createdAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentListResponse {
  posts: BlogPost[];
  total: number;
  limit: number;
  offset: number;
}

// Constants
export const CONTENT_TTL_SECONDS = 60 * 60 * 24 * 365 * 2; // 2 years
export const MAX_CONTENT_SIZE = 500 * 1024; // 500KB max content size
export const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 'img',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'hr',
];

export const ALLOWED_HTML_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  div: ['class'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};
