// Type for a single factor
export type Factor = {
  id: number;
  name: string;
  description: string;
  weight: number;
};

// Full list of 15 factors with weights
export const factors: Factor[] = [
  { id: 1, name: "robots.txt", description: "Controls AI and search engine access to the site.", weight: 9 },
  { id: 2, name: "sitemap.xml", description: "Ensures AI can find all important pages.", weight: 8 },
  { id: 3, name: "X-Robots-Tag", description: "Controls indexing of site sections by AI.", weight: 9 },
  { id: 4, name: "Meta robots", description: "Defines whether pages are indexed by AI.", weight: 9 },
  { id: 5, name: "Canonical", description: "Specifies the main version of the page for AI.", weight: 8 },
  { id: 6, name: "Title tag", description: "Indicates the topic of the page to AI.", weight: 7 },
  { id: 7, name: "Meta description", description: "Explains the page content to AI.", weight: 7 },
  { id: 8, name: "Open Graph", description: "Helps AI display the site correctly in results.", weight: 6 },
  { id: 9, name: "H1", description: "Main heading defines the topic for AI.", weight: 8 },
  { id: 10, name: "Structured Data", description: "Explains the type of content (products, events, etc.) to AI.", weight: 9 },
  { id: 11, name: "Mobile friendly", description: "Indicates usability of the site on mobile devices.", weight: 7 },
  { id: 12, name: "HTTPS / SSL", description: "Secure connection increases AI trust.", weight: 9 },
  { id: 13, name: "Alt attributes", description: "Explains images to AI.", weight: 6 },
  { id: 14, name: "Favicon", description: "Makes the site complete and recognizable for AI.", weight: 5 },
  { id: 15, name: "Page size", description: "Large pages are harder for AI to process.", weight: 7 },
];

// Calculate final score (all 15 factors)
export function calculateScore(results: { id: number; passed: boolean }[]): number {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const earnedWeight = results.reduce((sum, r) => {
    const f = factors.find((x) => x.id === r.id);
    return sum + (r.passed && f ? f.weight : 0);
  }, 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}

// Interpret visibility level
export function getVisibilityLevel(score: number): string {
  if (score >= 85) return "Excellent visibility";
  if (score >= 70) return "Good visibility";
  if (score >= 50) return "Moderate visibility";
  return "Low visibility";
}

// Calculate Quick Check score (first 5 factors only)
const quickCheckIds = [1, 2, 3, 4, 5];

export function calculateQuickScore(results: { id: number; passed: boolean }[]): number {
  const quickFactors = factors.filter(f => quickCheckIds.includes(f.id));
  const totalWeight = quickFactors.reduce((sum, f) => sum + f.weight, 0);
  const earnedWeight = results.reduce((sum, r) => {
    const f = quickFactors.find((x) => x.id === r.id);
    return sum + (r.passed && f ? f.weight : 0);
  }, 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}
