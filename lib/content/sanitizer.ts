import { ALLOWED_HTML_TAGS, ALLOWED_HTML_ATTRIBUTES } from '@/types/content';

/**
 * Sanitize HTML content
 * In production, use DOMPurify or sanitize-html library
 * This is a basic implementation for demonstration
 */
export function sanitizeHtml(html: string): string {
  // In production, use DOMPurify:
  // import DOMPurify from 'isomorphic-dompurify';
  // return DOMPurify.sanitize(html, {
  //   ALLOWED_TAGS: ALLOWED_HTML_TAGS,
  //   ALLOWED_ATTR: Object.keys(ALLOWED_HTML_ATTRIBUTES).reduce((acc, tag) => {
  //     return [...acc, ...ALLOWED_HTML_ATTRIBUTES[tag]];
  //   }, []),
  // });

  // Basic sanitization (remove script tags, dangerous attributes)
  let sanitized = html;

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  
  // Remove data: protocols (except safe image types)
  sanitized = sanitized.replace(/src\s*=\s*["']data:(?!image\/(png|jpg|jpeg|gif|webp))[^"']*["']/gi, 'src=""');

  return sanitized;
}

/**
 * Convert markdown to HTML
 * Basic implementation - in production use marked or remark
 */
export function markdownToHtml(markdown: string): string {
  // In production, use marked:
  // import { marked } from 'marked';
  // return marked.parse(markdown);

  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\_(.*?)\_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

/**
 * Extract plain text from HTML (for excerpts, search)
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength = 200): string {
  const plainText = stripHtml(content);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Cut at last complete word before maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadTime(content: string): number {
  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).length;
  const wordsPerMinute = 200; // Average reading speed
  
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Validate HTML structure (basic check)
 */
export function validateHtml(html: string): { valid: boolean; error?: string } {
  // Check for balanced tags (basic)
  const openTags = html.match(/<(\w+)[^>]*>/g) || [];
  const closeTags = html.match(/<\/(\w+)>/g) || [];
  
  if (openTags.length > closeTags.length * 2) {
    return { valid: false, error: 'Possibly unclosed tags detected' };
  }

  // Check for dangerous patterns
  if (/<script/i.test(html)) {
    return { valid: false, error: 'Script tags not allowed' };
  }

  if (/javascript:/i.test(html)) {
    return { valid: false, error: 'JavaScript protocol not allowed' };
  }

  return { valid: true };
}

/**
 * Sanitize and process content based on type
 */
export function processContent(content: string, contentType: 'html' | 'markdown'): string {
  if (contentType === 'markdown') {
    const html = markdownToHtml(content);
    return sanitizeHtml(html);
  }

  return sanitizeHtml(content);
}
