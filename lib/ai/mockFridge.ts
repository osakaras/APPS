import type { FridgeAnalysis } from "@/lib/ai/vision";

/**
 * Offline stand-in for the fridge vision model (no ANTHROPIC_API_KEY). Mirrors
 * a plausible inventory so the inspect → inventory → suggest loop runs locally.
 */
export function mockFridgeAnalysis(): FridgeAnalysis {
  return {
    items: [
      { label: "chicken breast", quantity: 500, unit: "g", confidence: 0.92 },
      { label: "baby spinach", quantity: 200, unit: "g", confidence: 0.88 },
      { label: "cherry tomato", quantity: 250, unit: "g", confidence: 0.85 },
      { label: "feta", quantity: 200, unit: "g", confidence: 0.83 },
      { label: "broccoli", quantity: 1, unit: "pcs", confidence: 0.8 },
      { label: "garlic", quantity: 1, unit: "pcs", confidence: 0.78 },
      { label: "olive oil", quantity: 500, unit: "ml", confidence: 0.9 },
    ],
  };
}
