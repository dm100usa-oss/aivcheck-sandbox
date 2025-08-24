// /lib/score.ts

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

// Weight of each factor
export const weightOf: Record<string, number> = {
  "robots.txt": 12,
  "sitemap.xml": 10,
  "meta_robots": 10,
  "structured_data": 10,
  "meta_description": 8,
  "open_graph": 7,
  "title": 8,
  "h1": 8,
  "https": 7,
  "mobile": 7,
  "alt": 5,
  "canonical": 4,
  "favicon": 2,
  "page_size": 2,
};

// Type for keys
export type CheckKey = typeof PRO_KEYS[number];

// Mode type
export type Mode = "quick" | "pro";

// Interpret numeric score into text
export function interpret(score: number): string {
  if (score >= 85) return "Excellent visibility";
  if (score >= 65) return "Good visibility";
  if (score >= 45) return "Moderate visibility";
  return "Low visibility";
}

// Convert keys to human-readable names
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
