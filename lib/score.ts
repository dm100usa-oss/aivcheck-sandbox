// /lib/score.ts

export type CheckResult = {
  id: number;
  name: string;
  description: string;
  passed: boolean;
  weight: number;
};

// Таблица весов для 15 пунктов
const weights: { id: number; weight: number }[] = [
  { id: 1, weight: 9 },   // robots.txt
  { id: 2, weight: 8 },   // sitemap.xml
  { id: 3, weight: 9 },   // X-Robots-Tag
  { id: 4, weight: 9 },   // Meta robots
  { id: 5, weight: 8 },   // Canonical
  { id: 6, weight: 7 },   // Title tag
  { id: 7, weight: 7 },   // Meta description
  { id: 8, weight: 6 },   // Open Graph
  { id: 9, weight: 8 },   // H1
  { id: 10, weight: 9 },  // Structured Data
  { id: 11, weight: 7 },  // Mobile friendly
  { id: 12, weight: 9 },  // HTTPS / SSL
  { id: 13, weight: 6 },  // Alt attributes
  { id: 14, weight: 5 },  // Favicon
  { id: 15, weight: 7 }   // Page size
];

// Подсчёт процента
export function calculateScore(results: CheckResult[]): number {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const earnedWeight = results.reduce((sum, r) => {
    const w = weights.find((x) => x.id === r.id);
    return sum + (r.passed && w ? w.weight : 0);
  }, 0);

  return Math.round((earnedWeight / totalWeight) * 100);
}
