import { kv } from '../redis';
import {
  BlogPost,
  Category,
  Tag,
  CreatePostInput,
  UpdatePostInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ContentListQuery,
  ContentListResponse,
  CONTENT_TTL_SECONDS,
} from '@/types/content';
import { randomUUID } from 'crypto';
import { processContent, generateExcerpt, calculateReadTime } from './sanitizer';
import { createVideoEmbed } from './video-embed';

// Redis key prefixes
const POST_PREFIX = 'content:post:';
const POST_SLUG_PREFIX = 'content:slug:';
const CATEGORY_PREFIX = 'content:category:';
const TAG_PREFIX = 'content:tag:';
const PUBLISHED_INDEX = 'content:published';
const DRAFT_INDEX = 'content:drafts';
const CATEGORY_INDEX = 'content:categories';
const TAG_INDEX = 'content:tags';

/**
 * Generate URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Create blog post
 */
export async function createPost(
  authorId: string,
  input: CreatePostInput
): Promise<BlogPost> {
  const now = Date.now();
  const postId = randomUUID();
  const slug = generateSlug(input.title) + '-' + postId.slice(0, 8);

  // Process content (sanitize HTML or convert markdown)
  const contentType = input.contentType || 'html';
  const processedContent = processContent(input.content, contentType);

  // Generate excerpt if not provided
  const excerpt = input.excerpt || generateExcerpt(processedContent);

  // Calculate read time
  const readTime = calculateReadTime(processedContent);

  // Handle video embed if provided
  let videoEmbed;
  if (input.videoEmbed?.url) {
    videoEmbed = await createVideoEmbed(input.videoEmbed.url);
  } else if (input.videoEmbed) {
    videoEmbed = input.videoEmbed as any;
  }

  const post: BlogPost = {
    id: postId,
    slug,
    title: input.title,
    excerpt,
    content: processedContent,
    contentType,
    author: authorId,
    featuredImage: input.featuredImage,
    status: input.status || 'draft',
    type: input.type || 'blog',
    categories: input.categories || [],
    tags: input.tags || [],
    videoEmbed,
    readTime,
    viewCount: 0,
    publishedAt: input.status === 'published' ? now : undefined,
    createdAt: now,
    updatedAt: now,
    seo: input.seo,
  };

  // Save post
  const postKey = `${POST_PREFIX}${postId}`;
  const slugKey = `${POST_SLUG_PREFIX}${slug}`;
  
  await kv.set(postKey, JSON.stringify(post), CONTENT_TTL_SECONDS);
  await kv.set(slugKey, postId, CONTENT_TTL_SECONDS); // slug -> postId mapping

  // Add to index
  if (post.status === 'published') {
    await addToIndex(PUBLISHED_INDEX, postId);
  } else {
    await addToIndex(DRAFT_INDEX, postId);
  }

  // Update category post counts
  for (const categoryId of post.categories) {
    await incrementCategoryCount(categoryId);
  }

  // Update tag post counts
  for (const tagId of post.tags) {
    await incrementTagCount(tagId);
  }

  return post;
}

/**
 * Get post by ID
 */
export async function getPost(postId: string): Promise<BlogPost | null> {
  const postKey = `${POST_PREFIX}${postId}`;
  const raw = await kv.get(postKey);
  
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BlogPost;
  } catch {
    return null;
  }
}

/**
 * Get post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const slugKey = `${POST_SLUG_PREFIX}${slug}`;
  const postId = await kv.get(slugKey);
  
  if (!postId) return null;

  return getPost(postId);
}

/**
 * Update post
 */
export async function updatePost(
  postId: string,
  authorId: string,
  input: UpdatePostInput
): Promise<BlogPost | null> {
  const post = await getPost(postId);
  
  if (!post || post.author !== authorId) {
    return null;
  }

  const now = Date.now();
  
  // Process content if updated
  let processedContent = post.content;
  if (input.content) {
    const contentType = input.contentType || post.contentType;
    processedContent = processContent(input.content, contentType);
  }

  // Update slug if title changed
  let newSlug = post.slug;
  if (input.slug) {
    newSlug = input.slug;
  } else if (input.title && input.title !== post.title) {
    newSlug = generateSlug(input.title) + '-' + postId.slice(0, 8);
  }

  const wasPublished = post.status === 'published';
  const willBePublished = (input.status || post.status) === 'published';

  const updatedPost: BlogPost = {
    ...post,
    ...input,
    content: processedContent,
    slug: newSlug,
    readTime: input.content ? calculateReadTime(processedContent) : post.readTime,
    publishedAt: willBePublished && !post.publishedAt ? now : post.publishedAt,
    updatedAt: now,
  };

  // Save updated post
  const postKey = `${POST_PREFIX}${postId}`;
  await kv.set(postKey, JSON.stringify(updatedPost), CONTENT_TTL_SECONDS);

  // Update slug mapping if changed
  if (newSlug !== post.slug) {
    const oldSlugKey = `${POST_SLUG_PREFIX}${post.slug}`;
    const newSlugKey = `${POST_SLUG_PREFIX}${newSlug}`;
    await kv.del(oldSlugKey);
    await kv.set(newSlugKey, postId, CONTENT_TTL_SECONDS);
  }

  // Update indexes if status changed
  if (wasPublished !== willBePublished) {
    if (willBePublished) {
      await removeFromIndex(DRAFT_INDEX, postId);
      await addToIndex(PUBLISHED_INDEX, postId);
    } else {
      await removeFromIndex(PUBLISHED_INDEX, postId);
      await addToIndex(DRAFT_INDEX, postId);
    }
  }

  return updatedPost;
}

/**
 * Delete post
 */
export async function deletePost(postId: string, authorId: string): Promise<boolean> {
  const post = await getPost(postId);
  
  if (!post || post.author !== authorId) {
    return false;
  }

  // Delete post
  const postKey = `${POST_PREFIX}${postId}`;
  const slugKey = `${POST_SLUG_PREFIX}${post.slug}`;
  
  await kv.del(postKey);
  await kv.del(slugKey);

  // Remove from indexes
  await removeFromIndex(PUBLISHED_INDEX, postId);
  await removeFromIndex(DRAFT_INDEX, postId);

  // Update category counts
  for (const categoryId of post.categories) {
    await decrementCategoryCount(categoryId);
  }

  // Update tag counts
  for (const tagId of post.tags) {
    await decrementTagCount(tagId);
  }

  return true;
}

/**
 * List posts with filtering
 */
export async function listPosts(query: ContentListQuery = {}): Promise<ContentListResponse> {
  const limit = query.limit || 20;
  const offset = query.offset || 0;

  // Resolve category slug to ID if provided
  let categoryId: string | undefined;
  if (query.category) {
    const category = await kv.get(`category:${query.category}`);
    if (category) {
      const parsedCategory = JSON.parse(category);
      categoryId = parsedCategory.id;
    }
  }

  // Resolve tag slug to ID if provided
  let tagId: string | undefined;
  if (query.tag) {
    const tag = await kv.get(`tag:${query.tag}`);
    if (tag) {
      const parsedTag = JSON.parse(tag);
      tagId = parsedTag.id;
    }
  }

  // Get post IDs from appropriate index
  let indexKey = query.status === 'draft' ? DRAFT_INDEX : PUBLISHED_INDEX;
  const indexRaw = await kv.get(indexKey);
  const postIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];

  // Fetch all posts (in production, implement pagination at Redis level)
  const posts: BlogPost[] = [];
  for (const postId of postIds) {
    const post = await getPost(postId);
    if (post) {
      posts.push(post);
    }
  }

  // Apply filters
  let filtered = posts;

  if (query.type) {
    filtered = filtered.filter((p) => p.type === query.type);
  }

  if (categoryId) {
    filtered = filtered.filter((p) => p.categories.includes(categoryId));
  }

  if (tagId) {
    filtered = filtered.filter((p) => p.tags.includes(tagId));
  }

  if (query.author) {
    filtered = filtered.filter((p) => p.author === query.author);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.excerpt?.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  const sortBy = query.sortBy || 'publishedAt';
  const sortOrder = query.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  // Paginate
  const paginated = filtered.slice(offset, offset + limit);

  return {
    posts: paginated,
    total: filtered.length,
    limit,
    offset,
  };
}

/**
 * Increment view count
 */
export async function incrementViewCount(postId: string): Promise<void> {
  const post = await getPost(postId);
  if (!post) return;

  post.viewCount++;
  post.updatedAt = Date.now();

  const postKey = `${POST_PREFIX}${postId}`;
  await kv.set(postKey, JSON.stringify(post), CONTENT_TTL_SECONDS);
}

// Category management
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const categoryId = randomUUID();
  const slug = generateSlug(input.name);

  const category: Category = {
    id: categoryId,
    name: input.name,
    slug,
    description: input.description,
    color: input.color,
    icon: input.icon,
    postCount: 0,
    createdAt: Date.now(),
  };

  const key = `${CATEGORY_PREFIX}${categoryId}`;
  await kv.set(key, JSON.stringify(category), CONTENT_TTL_SECONDS);
  await addToIndex(CATEGORY_INDEX, categoryId);

  return category;
}

export async function getCategory(categoryId: string): Promise<Category | null> {
  const key = `${CATEGORY_PREFIX}${categoryId}`;
  const raw = await kv.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Category;
  } catch {
    return null;
  }
}

export async function listCategories(): Promise<Category[]> {
  const indexRaw = await kv.get(CATEGORY_INDEX);
  const categoryIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];

  const categories: Category[] = [];
  for (const id of categoryIds) {
    const category = await getCategory(id);
    if (category) {
      categories.push(category);
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Tag management
export async function createTag(name: string): Promise<Tag> {
  const tagId = randomUUID();
  const slug = generateSlug(name);

  const tag: Tag = {
    id: tagId,
    name,
    slug,
    postCount: 0,
    createdAt: Date.now(),
  };

  const key = `${TAG_PREFIX}${tagId}`;
  await kv.set(key, JSON.stringify(tag), CONTENT_TTL_SECONDS);
  await addToIndex(TAG_INDEX, tagId);

  return tag;
}

export async function getTag(tagId: string): Promise<Tag | null> {
  const key = `${TAG_PREFIX}${tagId}`;
  const raw = await kv.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Tag;
  } catch {
    return null;
  }
}

export async function listTags(): Promise<Tag[]> {
  const indexRaw = await kv.get(TAG_INDEX);
  const tagIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];

  const tags: Tag[] = [];
  for (const id of tagIds) {
    const tag = await getTag(id);
    if (tag) {
      tags.push(tag);
    }
  }

  return tags.sort((a, b) => b.postCount - a.postCount);
}

// Helper functions
async function addToIndex(indexKey: string, id: string): Promise<void> {
  const raw = await kv.get(indexKey);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(id)) {
    ids.unshift(id);
    await kv.set(indexKey, JSON.stringify(ids), CONTENT_TTL_SECONDS);
  }
}

async function removeFromIndex(indexKey: string, id: string): Promise<void> {
  const raw = await kv.get(indexKey);
  if (!raw) return;

  const ids: string[] = JSON.parse(raw);
  const filtered = ids.filter((i) => i !== id);
  await kv.set(indexKey, JSON.stringify(filtered), CONTENT_TTL_SECONDS);
}

async function incrementCategoryCount(categoryId: string): Promise<void> {
  const category = await getCategory(categoryId);
  if (category) {
    category.postCount++;
    const key = `${CATEGORY_PREFIX}${categoryId}`;
    await kv.set(key, JSON.stringify(category), CONTENT_TTL_SECONDS);
  }
}

async function decrementCategoryCount(categoryId: string): Promise<void> {
  const category = await getCategory(categoryId);
  if (category && category.postCount > 0) {
    category.postCount--;
    const key = `${CATEGORY_PREFIX}${categoryId}`;
    await kv.set(key, JSON.stringify(category), CONTENT_TTL_SECONDS);
  }
}

async function incrementTagCount(tagId: string): Promise<void> {
  const tag = await getTag(tagId);
  if (tag) {
    tag.postCount++;
    const key = `${TAG_PREFIX}${tagId}`;
    await kv.set(key, JSON.stringify(tag), CONTENT_TTL_SECONDS);
  }
}

async function decrementTagCount(tagId: string): Promise<void> {
  const tag = await getTag(tagId);
  if (tag && tag.postCount > 0) {
    tag.postCount--;
    const key = `${TAG_PREFIX}${tagId}`;
    await kv.set(key, JSON.stringify(tag), CONTENT_TTL_SECONDS);
  }
}
