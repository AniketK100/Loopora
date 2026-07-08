/**
 * AI Service Provider Selector
 *
 * Implements a singleton provider pattern to abstract the underlying AI service.
 * The application imports from this file, allowing easy provider swapping.
 *
 * @module lib/ai/provider
 */

import { AIService } from "./types";
import { GeminiService } from "./gemini";

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    // ABSTRACTION LAYER: The provider choice can be configured via environment variables
    // without altering the consumer business logic.
    aiServiceInstance = new GeminiService();
  }
  return aiServiceInstance;
}
