import { VideoEmbed, VideoProvider } from '@/types/content';

/**
 * Parse video URL and extract provider and video ID
 */
export function parseVideoUrl(url: string): {
  provider: VideoProvider | null;
  videoId: string | null;
} {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'youtube', videoId: match[1] };
    }
  }

  // Instagram patterns
  const instagramPatterns = [
    /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
    /instagr\.am\/p\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of instagramPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'instagram', videoId: match[1] };
    }
  }

  // TikTok patterns
  const tiktokPatterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of tiktokPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'tiktok', videoId: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'vimeo', videoId: match[1] };
    }
  }

  return { provider: null, videoId: null };
}

/**
 * Generate embed URL for video
 */
export function generateEmbedUrl(provider: VideoProvider, videoId: string): string {
  switch (provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    
    case 'instagram':
      return `https://www.instagram.com/p/${videoId}/embed`;
    
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    
    default:
      return '';
  }
}

/**
 * Generate thumbnail URL for video
 */
export function generateThumbnailUrl(provider: VideoProvider, videoId: string): string {
  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    case 'instagram':
      // Instagram doesn't provide direct thumbnail URLs via ID
      // Would need to use oEmbed API or Graph API
      return `https://www.instagram.com/p/${videoId}/media/?size=l`;
    
    case 'tiktok':
      // TikTok thumbnails require API access
      return `https://www.tiktok.com/@placeholder/video/${videoId}`;
    
    case 'vimeo':
      // Vimeo thumbnails require API call, placeholder for now
      return `https://vimeo.com/api/v2/video/${videoId}.json`;
    
    default:
      return '';
  }
}

/**
 * Parse video URL and create full VideoEmbed object
 */
export async function createVideoEmbed(url: string): Promise<VideoEmbed | null> {
  const parsed = parseVideoUrl(url);
  
  if (!parsed.provider || !parsed.videoId) {
    return null;
  }

  const embedUrl = generateEmbedUrl(parsed.provider, parsed.videoId);
  const thumbnailUrl = generateThumbnailUrl(parsed.provider, parsed.videoId);

  // In production, fetch actual metadata from provider APIs
  // For now, return basic embed info
  return {
    provider: parsed.provider,
    videoId: parsed.videoId,
    embedUrl,
    thumbnailUrl,
    width: 1280,
    height: 720,
  };
}

/**
 * Fetch video metadata from provider API (stub)
 * In production, implement API calls to each provider
 */
export async function fetchVideoMetadata(
  provider: VideoProvider,
  videoId: string
): Promise<{
  title?: string;
  duration?: number;
  thumbnailUrl?: string;
}> {
  // In production, make actual API calls:
  
  // YouTube Data API v3:
  // const response = await fetch(
  //   `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails`
  // );

  // Instagram Graph API:
  // const response = await fetch(
  //   `https://graph.instagram.com/${videoId}?fields=thumbnail_url,title&access_token=${ACCESS_TOKEN}`
  // );

  // TikTok API:
  // Requires OAuth and app approval

  // Vimeo API:
  // const response = await fetch(
  //   `https://api.vimeo.com/videos/${videoId}`,
  //   { headers: { 'Authorization': `bearer ${ACCESS_TOKEN}` } }
  // );

  // Mock response
  return {
    title: 'Video Title',
    duration: 120,
    thumbnailUrl: generateThumbnailUrl(provider, videoId),
  };
}

/**
 * Validate video embed URL
 */
export function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  const parsed = parseVideoUrl(url);
  
  if (!parsed.provider) {
    return {
      valid: false,
      error: 'Unsupported video provider. Supported: YouTube, Instagram, TikTok, Vimeo',
    };
  }

  if (!parsed.videoId) {
    return { valid: false, error: 'Could not extract video ID from URL' };
  }

  return { valid: true };
}

/**
 * Get embed dimensions based on provider defaults
 */
export function getEmbedDimensions(provider: VideoProvider): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  switch (provider) {
    case 'youtube':
    case 'vimeo':
      return { width: 1280, height: 720, aspectRatio: '16:9' };
    
    case 'instagram':
    case 'tiktok':
      return { width: 405, height: 720, aspectRatio: '9:16' };
    
    default:
      return { width: 1280, height: 720, aspectRatio: '16:9' };
  }
}
