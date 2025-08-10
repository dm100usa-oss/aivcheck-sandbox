import type { CheckKey } from "./score";

export type CheckResult = {
  key: CheckKey;
  name: string;
  passed: boolean;
  description: string;
};

export type AnalyzeResponse = {
  url: string;
  mode: "quick" | "full";
  results: CheckResult[];
  score: number; // 0..100
  interpretation: "Low" | "Moderate" | "Good" | "Excellent";
};
