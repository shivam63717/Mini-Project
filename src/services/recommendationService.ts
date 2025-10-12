
/**
 * Simple in-memory recommendation stub.
 * Replace with real model inference or external ML API integration.
 */
export interface RecommendationInput {
  userId: string;
  recentItemIds?: string[];
}

export interface RecommendationResult {
  userId: string;
  recommendations: { itemId: string; score: number }[];
  generatedAt: string;
}

export class RecommendationService {
  // Inject a model, vector store, or HTTP client in real implementation
  async getRecommendations(input: RecommendationInput): Promise<RecommendationResult> {
    const base = input.recentItemIds?.slice(-5) ?? [];
    const recs = Array.from({ length: 5 }).map((_, i) => ({
      itemId: base[i] || `item-${Math.floor(Math.random() * 1000)}`,
      score: Number((Math.random() * 0.5 + 0.5).toFixed(3))
    }));
    return {
      userId: input.userId,
      recommendations: recs.sort((a, b) => b.score - a.score),
      generatedAt: new Date().toISOString()
    };
  }
}

export const recommendationService = new RecommendationService();