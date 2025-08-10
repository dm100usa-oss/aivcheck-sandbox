export type CheckKey =
  | "robots_txt"
  | "sitemap_xml"
  | "x_robots_tag"
  | "meta_robots"
  | "canonical"
  | "title"
  | "meta_description"
  | "og_title"
  | "og_description"
  | "h1"
  | "structured_data"
  | "ai_instructions"
  | "img_alt"
  | "favicon"
  | "status_redirects";

export const WEIGHTS: Record<CheckKey, number> = {
  robots_txt: 10,
  sitemap_xml: 8,
  x_robots_tag: 6,
  meta_robots: 7,
  canonical: 7,
  title: 10,
  meta_description: 8,
  og_title: 5,
  og_description: 5,
  h1: 6,
  structured_data: 10,
  ai_instructions: 6,
  img_alt: 6,
  favicon: 3,
  status_redirects: 7,
};

export const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 100
