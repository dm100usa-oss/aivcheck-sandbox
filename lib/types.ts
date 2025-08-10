import type { CheckKey } from "./score";

export type CheckResult = {
  key: CheckKey | string;
  name: string;
  passed: boolean;
  description: string;
};

export type AnalyzeResponse = {
  url: string;
  mode: "quick" | "full";
  results: CheckResult[];
  score: number;
  interpretation: "Low" | "Moderate" | "Good" | "Excellent";
};
