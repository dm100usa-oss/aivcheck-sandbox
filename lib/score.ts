// lib/score.ts

// Keys for Quick Check
export const QUICK_KEYS = [
  "robots.txt",
  "sitemap.xml",
  "meta_robots",
  "structured_data",
  "meta_description",
];

// Keys for Full (Pro) Check
export const PRO_KEYS = [
  ...QUICK_KEYS,
  "open_graph",
  "title",
  "h1",
  "https",
  "mobile",
  "alt",
  "canonical",
  "favicon",
  "page_size",
];

// Weight of each factor (0–1)
export const weightOf: Record<string, number> = {
  "robots.txt": 0.12,
  "sitemap.xml": 0.10,
  "meta_robots": 0.10,
  "structured_data": 0.10,
  "meta_description": 0.08,
  "open_graph": 0.07,
  "title": 0.08,
  "h1": 0.08,
  "https": 0.07,
  "mobile": 0.07,
  "alt": 0.05,
  "canonical": 0.04,
  "favicon": 0.02,
  "page_size": 0.02,
};

// Key type
export type CheckKey = typeof PRO_KEYS[number];

// Check modes
export type Mode = "quick" | "pro";

// Interpret score into text
export function interpret(score: number): string {
  if (score >= 85) return "Excellent visibility";
  if (score >= 65) return "Good visibility";
  if (score >= 45) return "Moderate visibility";
  return "Low visibility";
}

// Human-readable names
export function nameOf(key: CheckKey): string {
  switch (key) {
    case "robots.txt": return "Robots.txt";
    case "sitemap.xml": return "Sitemap";
    case "meta_robots": return "Meta Robots";
    case "structured_data": return "Structured Data";
    case "meta_description": return "Meta Description";
    case "open_graph": return "Open Graph";
    case "title": return "Title Tag";
    case "h1": return "Main Heading (H1)";
    case "https": return "HTTPS / SSL";
    case "mobile": return "Mobile Friendly";
    case "alt": return "Image Alt Text";
    case "canonical": return "Canonical Tag";
    case "favicon": return "Favicon";
    case "page_size": return "Page Size";
    default: return key;
  }
}
