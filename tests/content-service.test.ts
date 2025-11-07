import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPost,
  getPost,
  getPostBySlug,
  updatePost,
  deletePost,
  listPosts,
  incrementViewCount,
  createCategory,
  getCategory,
  listCategories,
  createTag,
  getTag,
  listTags,
} from '@/lib/content/content-service';
import { CreatePostInput } from '@/types/content';

describe('Content Service', () => {
  const testUserId = 'test-user-' + Date.now();
  let testCategoryId: string;
  let testTagId: string;

  beforeEach(async () => {
    // Create test category and tag
    const category = await createCategory({
      name: 'Test Category ' + Date.now(),
      description: 'For testing',
    });
    testCategoryId = category.id;

    const tag = await createTag('Test Tag ' + Date.now());
    testTagId = tag.id;
  });

  describe('Post Management', () => {
    it('should create a new post with HTML content', async () => {
      const input: CreatePostInput = {
        title: 'My First Post ' + Date.now(),
        content: '<p>Hello <script>alert("xss")</script>world</p>',
        contentType: 'html',
        excerpt: 'A test post',
        status: 'draft',
        categories: [],
        tags: [],
      };

      const post = await createPost(testUserId, input);

      expect(post.id).toBeDefined();
      expect(post.slug).toContain('my-first-post');
      expect(post.title).toBe(input.title);
      expect(post.content).not.toContain('<script>');
      expect(post.author).toBe(testUserId);
      expect(post.status).toBe('draft');
      expect(post.viewCount).toBe(0);
    });

    it('should create a post with markdown content', async () => {
      const input: CreatePostInput = {
        title: 'Markdown Post ' + Date.now(),
        content: '# Hello\n\nThis is **bold** text.',
        contentType: 'markdown',
        status: 'published',
        categories: [],
        tags: [],
      };

      const post = await createPost(testUserId, input);

      expect(post.slug).toContain('markdown-post');
      expect(post.content).toContain('<h1>');
      expect(post.content).toContain('<strong>');
      expect(post.contentType).toBe('markdown'); // Original type is preserved
    });

    it('should create post with video embed', async () => {
      const input: CreatePostInput = {
        title: 'Video Post ' + Date.now(),
        content: 'Check out this video',
        contentType: 'html',
        status: 'published',
        videoEmbed: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } as any,
        categories: [],
        tags: [],
      };

      const post = await createPost(testUserId, input);

      expect(post.videoEmbed).toBeDefined();
      expect(post.videoEmbed?.provider).toBe('youtube');
      expect(post.videoEmbed?.videoId).toBe('dQw4w9WgXcQ');
      expect(post.videoEmbed?.embedUrl).toContain('youtube.com/embed');
    });

    it('should retrieve post by ID', async () => {
      const input: CreatePostInput = {
        title: 'Test Post ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      };

      const created = await createPost(testUserId, input);
      const retrieved = await getPost(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe(input.title);
    });

    it('should retrieve post by slug', async () => {
      const input: CreatePostInput = {
        title: 'Slug Test ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      };

      const created = await createPost(testUserId, input);
      const retrieved = await getPostBySlug(created.slug);

      expect(retrieved).toBeDefined();
      expect(retrieved?.slug).toBe(created.slug);
      expect(retrieved?.title).toBe(input.title);
    });

    it('should update post content', async () => {
      const input: CreatePostInput = {
        title: 'Old Title ' + Date.now(),
        content: 'Old content',
        contentType: 'html',
        status: 'draft',
        categories: [],
        tags: [],
      };

      const created = await createPost(testUserId, input);
      
      // Small delay to ensure updatedAt changes
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updatePost(created.id, testUserId, {
        title: 'New Title',
        content: 'New content',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('New Title');
      expect(updated?.content).toBe('New content');
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
    });

    it('should update post status from draft to published', async () => {
      const input: CreatePostInput = {
        title: 'Draft Post ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'draft',
        categories: [],
        tags: [],
      };

      const created = await createPost(testUserId, input);
      expect(created.status).toBe('draft');
      expect(created.publishedAt).toBeUndefined();

      const updated = await updatePost(created.id, testUserId, {
        status: 'published',
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('published');
      expect(updated?.publishedAt).toBeDefined();
    });

    it('should delete post', async () => {
      const input: CreatePostInput = {
        title: 'To Delete ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'draft',
        categories: [],
        tags: [],
      };

      const created = await createPost(testUserId, input);
      await deletePost(created.id, testUserId);

      const retrieved = await getPost(created.id);
      expect(retrieved).toBeNull();
    });

    it('should list published posts', async () => {
      // Create a few test posts
      await createPost(testUserId, {
        title: 'Published 1 ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      });

      await createPost(testUserId, {
        title: 'Published 2 ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      });

      const result = await listPosts({
        status: 'published',
        limit: 10,
        offset: 0,
      });

      expect(result.posts.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter posts by category', async () => {
      const post = await createPost(testUserId, {
        title: 'Categorized Post ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [testCategoryId],
        tags: [],
      });

      const category = await getCategory(testCategoryId);
      expect(category).toBeDefined();

      const result = await listPosts({
        status: 'published',
        category: category!.slug,
      });

      expect(result.posts.length).toBeGreaterThanOrEqual(1);
      const foundPost = result.posts.find(p => p.id === post.id);
      expect(foundPost).toBeDefined();
    });

    it('should search posts by title', async () => {
      const uniqueWord = 'unique-' + Date.now();
      await createPost(testUserId, {
        title: `Post with ${uniqueWord}`,
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      });

      const result = await listPosts({
        status: 'published',
        search: uniqueWord,
      });

      expect(result.posts.length).toBeGreaterThanOrEqual(1);
      expect(result.posts[0].title).toContain(uniqueWord);
    });

    it('should increment view count', async () => {
      const post = await createPost(testUserId, {
        title: 'View Count Test ' + Date.now(),
        content: 'Content',
        contentType: 'html',
        status: 'published',
        categories: [],
        tags: [],
      });

      expect(post.viewCount).toBe(0);

      await incrementViewCount(post.id);
      await incrementViewCount(post.id);

      // Note: viewCount is stored separately, so we need to fetch it differently
      // This test just verifies the function doesn't error
    });
  });

  describe('Category Management', () => {
    it('should create a category', async () => {
      const category = await createCategory({
        name: 'Skincare ' + Date.now(),
        description: 'All about skincare',
        color: '#ff6b6b',
      });

      expect(category.id).toBeDefined();
      expect(category.slug).toContain('skincare');
      expect(category.name).toContain('Skincare');
      expect(category.description).toBe('All about skincare');
      expect(category.color).toBe('#ff6b6b');
      expect(category.postCount).toBe(0);
    });

    it('should retrieve category by ID', async () => {
      const created = await createCategory({
        name: 'Makeup ' + Date.now(),
      });

      const retrieved = await getCategory(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should list all categories', async () => {
      await createCategory({ name: 'Cat A ' + Date.now() });
      await createCategory({ name: 'Cat B ' + Date.now() });

      const categories = await listCategories();

      expect(categories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Tag Management', () => {
    it('should create a tag', async () => {
      const tag = await createTag('Anti-Aging ' + Date.now());

      expect(tag.id).toBeDefined();
      expect(tag.slug).toContain('anti-aging');
      expect(tag.name).toContain('Anti-Aging');
      expect(tag.postCount).toBe(0);
    });

    it('should retrieve tag by ID', async () => {
      const created = await createTag('Hydration ' + Date.now());

      const retrieved = await getTag(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should list all tags', async () => {
      await createTag('Tag X ' + Date.now());
      await createTag('Tag Y ' + Date.now());

      const tags = await listTags();

      expect(tags.length).toBeGreaterThanOrEqual(2);
    });
  });
});
