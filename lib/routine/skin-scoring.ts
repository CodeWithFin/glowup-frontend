import { SkinMetrics, SkinConcern } from '@/types/routine';

/**
 * Calculate overall skin score from individual metrics
 */
export function calculateOverallScore(metrics: Partial<SkinMetrics>): number {
  const scores = [
    metrics.hydration,
    metrics.texture,
    metrics.brightness,
    metrics.clarity,
  ].filter((score) => score !== undefined) as number[];

  if (scores.length === 0) return 0;

  const sum = scores.reduce((total, score) => total + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Analyze skin concerns from metrics
 * Stub - in production, use ML model or advanced analysis
 */
export function analyzeSkinConcerns(metrics: SkinMetrics): SkinConcern[] {
  const concerns: SkinConcern[] = [];

  if (metrics.hydration !== undefined && metrics.hydration < 40) {
    concerns.push('dryness');
  }

  if (metrics.texture !== undefined && metrics.texture < 50) {
    concerns.push('texture');
  }

  if (metrics.clarity !== undefined && metrics.clarity < 50) {
    concerns.push('acne');
  }

  if (metrics.brightness !== undefined && metrics.brightness < 50) {
    concerns.push('dark_spots');
  }

  return concerns;
}

/**
 * Compare two skin metric sets and calculate improvement
 */
export function compareMetrics(
  before: SkinMetrics,
  after: SkinMetrics
): {
  improvement: number; // -100 to 100
  improved: string[];
  declined: string[];
  stable: string[];
} {
  const metrics = ['hydration', 'texture', 'brightness', 'clarity'] as const;
  const improved: string[] = [];
  const declined: string[] = [];
  const stable: string[] = [];

  let totalDifference = 0;
  let metricCount = 0;

  for (const metric of metrics) {
    const beforeValue = before[metric];
    const afterValue = after[metric];

    if (beforeValue !== undefined && afterValue !== undefined) {
      const difference = afterValue - beforeValue;
      totalDifference += difference;
      metricCount++;

      if (difference > 5) {
        improved.push(metric);
      } else if (difference < -5) {
        declined.push(metric);
      } else {
        stable.push(metric);
      }
    }
  }

  const improvement = metricCount > 0 ? Math.round(totalDifference / metricCount) : 0;

  return { improvement, improved, declined, stable };
}

/**
 * Generate skin score from photo analysis
 * Stub - in production, integrate with ML model (TensorFlow, AWS Rekognition, etc.)
 */
export async function analyzePhotoForSkinMetrics(
  photoUrl: string
): Promise<SkinMetrics> {
  // In production, send photo to ML service:
  // const response = await fetch('https://ml-api.example.com/analyze', {
  //   method: 'POST',
  //   body: JSON.stringify({ imageUrl: photoUrl }),
  // });
  // return response.json();

  // Mock implementation - returns random scores
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate API delay

  const hydration = Math.floor(Math.random() * 40) + 50; // 50-90
  const texture = Math.floor(Math.random() * 40) + 50;
  const brightness = Math.floor(Math.random() * 40) + 50;
  const clarity = Math.floor(Math.random() * 40) + 50;

  const metrics: SkinMetrics = {
    hydration,
    texture,
    brightness,
    clarity,
    overallScore: calculateOverallScore({ hydration, texture, brightness, clarity }),
    notes: 'Auto-generated from photo analysis (stub)',
  };

  metrics.concerns = analyzeSkinConcerns(metrics);

  return metrics;
}

/**
 * Calculate routine effectiveness score
 * Based on progress over time
 */
export function calculateRoutineEffectiveness(
  entries: Array<{ date: number; skinMetrics?: SkinMetrics }>
): {
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  avgProgress: number;
} {
  if (entries.length < 2) {
    return { score: 50, trend: 'stable', avgProgress: 0 };
  }

  // Get entries with metrics, sorted by date
  const withMetrics = entries
    .filter((e) => e.skinMetrics?.overallScore)
    .sort((a, b) => a.date - b.date);

  if (withMetrics.length < 2) {
    return { score: 50, trend: 'stable', avgProgress: 0 };
  }

  const firstScore = withMetrics[0].skinMetrics!.overallScore!;
  const lastScore = withMetrics[withMetrics.length - 1].skinMetrics!.overallScore!;
  const avgProgress = lastScore - firstScore;

  let trend: 'improving' | 'stable' | 'declining';
  if (avgProgress > 5) {
    trend = 'improving';
  } else if (avgProgress < -5) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Score is based on latest metrics and trend
  const trendBonus = trend === 'improving' ? 10 : trend === 'declining' ? -10 : 0;
  const score = Math.max(0, Math.min(100, lastScore + trendBonus));

  return { score, trend, avgProgress };
}

/**
 * Generate recommendations based on metrics
 */
export function generateRecommendations(metrics: SkinMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.hydration !== undefined && metrics.hydration < 50) {
    recommendations.push('Increase hydration: Use a richer moisturizer and drink more water');
  }

  if (metrics.texture !== undefined && metrics.texture < 50) {
    recommendations.push('Improve texture: Consider adding an exfoliating product to your routine');
  }

  if (metrics.brightness !== undefined && metrics.brightness < 50) {
    recommendations.push('Boost brightness: Try products with vitamin C or niacinamide');
  }

  if (metrics.clarity !== undefined && metrics.clarity < 50) {
    recommendations.push('Enhance clarity: Look for products with salicylic acid or retinol');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your skin is looking great! Keep up with your current routine');
  }

  return recommendations;
}
