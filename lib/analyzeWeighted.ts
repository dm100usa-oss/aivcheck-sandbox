// /lib/analyzeWeighted.ts
import type { AnalyzeReturn, CheckResult } from './types';

/**
 * Helper: boolean -> 0/1
 */
const b = (v: boolean) => (v ? 1 : 0);

/**
 * Very basic synchronous checks.
 * Replace internals later with real HTTP fetches & parsing.
 */
export async function analyzeWeighted(url: string): Promise<AnalyzeReturn> {
  // Minimal URL sanity (network checks can be added later)
  const u = new URL(url);

  // Dummy results for now (replace with real detectors)
  const checks: CheckResult[] = [
    { key: 'robots_txt', name: 'robots.txt', passed: true,  description: 'robots.txt is present' },
    { key: 'sitemap_xml', name: 'sitemap.xml', passed: true, description: 'sitemap.xml found' },
    { key: 'x_robots', name: 'X-Robots-Tag (header)', passed: true, description: 'No X-Robots-Tag header (OK)' },
    { key: 'meta_robots', name: 'Meta robots', passed: true, description: 'No meta robots (OK)' },
    { key: 'canonical', name: 'Canonical', passed: true, description: `Canonical: ${u.href}` },

    { key: 'title', name: 'Title tag', passed: true, description: 'Title present' },
    { key: 'meta_description', name: 'Meta description', passed: false, description: 'Missing meta description' },
    { key: 'og_title', name: 'OG title', passed: true, description: 'og:title present' },
    { key: 'og_description', name: 'OG description', passed: false, description: 'Missing og:description' },
    { key: 'h1', name: 'H1', passed: false, description: 'Missing <h1>' },

    { key: 'json_ld', name: 'Structured data (JSON-LD)', passed: false, description: 'No JSON-LD' },
    { key: 'ai_instructions', name: 'AI instructions', passed: false, description: 'No AI directives found' },
    { key: 'image_alt', name: 'Image alt', passed: false, description: 'Some images missing alt' },
    { key: 'favicon', name: 'Favicon', passed: true, description: 'Favicon link found' },
    { key: 'http', name: 'HTTP status/redirects', passed: true, description: 'Status: 200' },
  ];

  // Equal weights (you can tune later)
  const weight = 1 / checks.length;
  const raw = checks.reduce((sum, c) => sum + b(c.passed) * weight, 0);
  const score = Math.round(raw * 100);

  let interpretation: AnalyzeReturn['interpretation'] = 'Poor';
  if (score >= 85) interpretation = 'Excellent';
  else if (score >= 70) interpretation = 'Good';
  else if (score >= 50) interpretation = 'Moderate';

  return { score, checks, interpretation };
}
