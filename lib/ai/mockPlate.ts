import type { PlateAnalysis } from "@/lib/ai/vision";

/**
 * Deterministic stand-in for the vision model, used when ANTHROPIC_API_KEY is
 * absent (local/preview). Lets the entire capture → log → taste-matrix loop run
 * end to end without external calls. Clearly labeled via ai_model = "mock".
 */
export function mockPlateAnalysis(): PlateAnalysis {
  return {
    title: "Grilled chicken & quinoa bowl",
    kcal: 540,
    protein_g: 42,
    carbs_g: 48,
    fat_g: 18,
    health_rating: "great",
    health_notes:
      "Lean protein with complex carbohydrate and leafy micronutrients — strong recovery substrate.",
    items: [
      { label: "chicken breast", quantity: 150, unit: "g", confidence: 0.94 },
      { label: "quinoa", quantity: 120, unit: "g", confidence: 0.9 },
      { label: "baby spinach", quantity: 40, unit: "g", confidence: 0.86 },
      { label: "cherry tomato", quantity: 60, unit: "g", confidence: 0.81 },
      { label: "olive oil", quantity: 10, unit: "ml", confidence: 0.7 },
    ],
    confidence: 0.88,
  };
}
