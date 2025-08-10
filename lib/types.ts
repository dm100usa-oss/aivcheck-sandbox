// lib/types.ts
export type Check = {
  key?: string;
  name: string;
  passed: boolean;
  description: string;
};

export type AnalyzeWeightedReturn = {
  score: number; // 0..100
  checks: Check[]; // length = 15 for full audit
  interpretation?: string; // e.g., "Excellent" | "Moderate" | "Low"
};
