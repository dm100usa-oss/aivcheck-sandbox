// lib/score.ts

// Factor definition
export type Factor = {
  id: number;
  name: string;
  description: string;
  weight: number; // 1–10
};

// Full list of 15 factors
export const factors: Factor[] = [
  {
    id: 1,
    name: "robots.txt",
    description:
      "Controls whether AI and search engines can access your site. If access is restricted, the site will not appear in results.",
    weight: 10,
  },
  {
    id: 2,
    name: "sitemap.xml",
    description:
      "Provides AI and search engines with a map of your site. Without it, important pages may remain invisible.",
    weight: 9,
  },
  {
    id: 3,
    name: "X-Robots-Tag",
    description:
      "HTTP headers that control indexing. If configured incorrectly, parts of the site are not shown in results.",
    weight: 9,
  },
  {
    id: 4,
    name: "Meta robots",
    description:
      "Meta tags that manage indexing. Wrong settings (noindex) prevent pages from appearing in results.",
    weight: 8,
  },
  {
    id: 5,
    name: "Canonical",
    description:
      "Defines the main version of a page. If missing or incorrect, duplicates confuse AI and the correct page is not shown.",
    weight: 7,
  },
  {
    id: 6,
    name: "Title tag",
    description:
      "Indicates the main topic of the page. If missing or vague, AI does not match the page to relevant queries.",
    weight: 9,
  },
  {
    id: 7,
    name: "Meta description",
    description:
      "Summarizes the content of the page. If absent or misleading, the page loses visibility in AI answers.",
    weight: 7,
  },
  {
    id: 8,
    name: "Open Graph",
    description:
      "Social tags that help AI display your site correctly. If missing, the site appears incomplete and is shown less often.",
    weight: 6,
  },
  {
    id: 9,
    name: "H1",
    description:
      "The main heading of the page. If absent or duplicated, AI cannot correctly identify the topic and visibility is lost.",
    weight: 8,
  },
  {
    id: 10,
    name: "Structured Data (JSON-LD)",
    description:
      "Explains to AI what the site contains (products, articles, events). Without it, AI cannot use the site in extended answers.",
    weight: 9,
  },
  {
    id: 11,
    name: "Mobile friendly",
    description:
      "If the site is not mobile-optimized, AI considers it outdated. Such sites appear last in results.",
    weight: 8,
  },
  {
    id: 12,
    name: "HTTPS / SSL",
    description:
      "Secure connection. Without HTTPS, AI considers the site unsafe and excludes it from results.",
    weight: 10,
  },
  {
    id: 13,
    name: "Alt attributes",
    description:
      "Help AI understand images. Without alt text, visual content is ignored and pages lose visibility in image-related queries.",
    weight: 7,
  },
  {
    id: 14,
    name: "Favicon",
    description:
      "A small icon for recognition. Without it, the site looks incomplete and is skipped in results.",
    weight: 4,
  },
  {
    id: 15,
    name: "Page size",
    description:
      "If a page is too large and heavy, AI cannot process it correctly. Such pages are excluded from results.",
    weight: 6,
  },
];

// Keys for quick and pro checks (compatibility with analyze.ts)
export const QUICK_KEYS = [1, 2, 3, 4, 5];
export const PRO_KEYS = factors.map((f) => f.id);

// Helper functions
export function weightOf(id: number): number {
  const f = factors.find((f) => f.id === id);
  return f ? f.weight : 0;
}

export function nameOf(id: number): string {
  const f = factors.find((f) => f.id === id);
  return f ? f.name : `Unknown factor ${id}`;
}
