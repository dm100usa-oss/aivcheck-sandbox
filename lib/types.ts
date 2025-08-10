// /lib/types.ts
export type CheckKey =
  | 'robots_txt' | 'sitemap_xml' | 'x_robots' | 'meta_robots' | 'canonical'
  | 'title' | 'meta_description' | 'og_title' | 'og_description' | 'h1'
  | 'json_ld' | 'ai_instructions' | 'image_alt' | 'favicon' | 'http';

export type CheckResult = {
  key: CheckKey;
  name: string;
  passed: boolean;
  description: string;
};

export type AnalyzeReturn = {
  score: number;                 // 0..100
  checks: CheckResult[];         // all 15 checks
  interpretation: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
};
