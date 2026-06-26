import type { HealthRating, MeasureUnit } from "@/lib/types";

/**
 * AI vision adapters for the Plate Scanner and Fridge Inspector.
 *
 * Uses Anthropic Claude vision by default. The model is asked to return strict
 * JSON which we validate before it ever reaches the database. Keeping the
 * prompt + parsing here means the route handlers stay thin.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface DetectedItem {
  label: string;
  quantity: number | null;
  unit: MeasureUnit | null;
  confidence: number;
}

export interface PlateAnalysis {
  title: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_rating: HealthRating;
  health_notes: string;
  items: DetectedItem[];
  confidence: number;
}

export interface FridgeAnalysis {
  items: DetectedItem[];
}

const PLATE_PROMPT = `You are a nutrition vision model. Analyze the meal in the image.
Return ONLY minified JSON matching this TypeScript type, no prose:
{"title":string,"kcal":number,"protein_g":number,"carbs_g":number,"fat_g":number,
"health_rating":"poor"|"fair"|"good"|"great"|"excellent","health_notes":string,
"items":[{"label":string,"quantity":number|null,"unit":string|null,"confidence":number}],
"confidence":number}
Estimate macros for the full plate. health_notes is one warm, holistic sentence.`;

const FRIDGE_PROMPT = `You are a fridge-inventory vision model. List every distinct food
item visible inside the fridge. Return ONLY minified JSON:
{"items":[{"label":string,"quantity":number|null,"unit":string|null,"confidence":number}]}
Use singular lowercase labels. Estimate quantity/unit when obvious, else null.`;

async function callClaudeVision(prompt: string, imageBase64: string, mediaType: string) {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_VISION_MODEL ?? "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Vision API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  return parseJsonBlock(text);
}

/** Extract the first JSON object from a model response, tolerating fences. */
function parseJsonBlock(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in vision response");
  return JSON.parse(match[0]);
}

export async function analyzePlate(
  imageBase64: string,
  mediaType = "image/jpeg",
): Promise<PlateAnalysis> {
  return (await callClaudeVision(PLATE_PROMPT, imageBase64, mediaType)) as PlateAnalysis;
}

export async function analyzeFridge(
  imageBase64: string,
  mediaType = "image/jpeg",
): Promise<FridgeAnalysis> {
  return (await callClaudeVision(FRIDGE_PROMPT, imageBase64, mediaType)) as FridgeAnalysis;
}
