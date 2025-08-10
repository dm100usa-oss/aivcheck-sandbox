// Simple, compile-safe analyzer: no external libs.
// Returns 15 checks + weighted score. All text in EN.

type CheckResult = {
  key: string;
  name: string;
  passed: boolean;
  description: string;
  weight: number;
};

const WEIGHTS: Record<string, number> = {
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

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

// Small helpers (regex based)
function has(html: string, re: RegExp): boolean {
  return re.test(html);
}
function match1(html: string, re: RegExp): string {
  const m = html.match(re);
  return m?.[1]?.trim() ?? "";
}

export async function analyzeWeighted(
  html: string,
  url: string
): Promise<{ score: number; checks: Omit<CheckResult, "weight">[] }> {
  // Basic signals from HTML (regex only)
  const xRobotsHeader = ""; // not available from raw HTML here
  const status = 200; // not available here; assume OK (we only need to compile & run)

  const metaRobotsContent = match1(
    html,
    /<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i
  );
  const canonicalHref = match1(
    html,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i
  );
  const titleText = match1(html, /<title>([^<]*)<\/title>/i);
  const metaDescription = match1(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i
  );
  const ogTitle = match1(
    html,
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["'][^>]*>/i
  );
  const ogDesc = match1(
    html,
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["'][^>]*>/i
  );

  const haveH1 = has(html, /<h1\b[^>]*>.*?<\/h1>/is);
  const haveJsonLd = has(
    html,
    /<script\s+type=["']application\/ld\+json["'][^>]*>.*?<\/script>/is
  );
  const haveAiMeta = has(html, /<meta\s+name=["']ai["'][^>]*>/i);
  const imgNoAlt = has(html, /<img\b(?![^>]*\balt=)[^>]*>/i);
  const haveFavicon = has(
    html,
    /<link\s+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/i
  );

  // NOTE: robots.txt / sitemap.xml / status/redirects / X-Robots-Tag
  // cannot be determined from raw HTML here. For now we set neutral assumptions
  // so the page compiles and app works. Later the API can fetch them server-side.
  const robotsTxtPassed = false;
  const sitemapXmlPassed = false;
  const xRobotsPassed = true; // treat as OK when unknown
  const statusPassed = true;  // treat as OK when unknown

  const checks: CheckResult[] = [
    {
      key: "robots_txt",
      name: "robots.txt",
      passed: robotsTxtPassed,
      description: robotsTxtPassed ? "robots.txt is present" : "robots.txt not verified",
      weight: WEIGHTS.robots_txt,
    },
    {
      key: "sitemap_xml",
      name: "sitemap.xml",
      passed: sitemapXmlPassed,
      description: sitemapXmlPassed ? "sitemap.xml found" : "sitemap.xml not verified",
      weight: WEIGHTS.sitemap_xml,
    },
    {
      key: "x_robots_tag",
      name: "X-Robots-Tag (header)",
      passed: xRobotsPassed,
      description: xRobotsHeader ? `X-Robots-Tag: ${xRobotsHeader}` : "Header not checked (assumed OK)",
      weight: WEIGHTS.x_robots_tag,
    },
    {
      key: "meta_robots",
      name: "Meta robots",
      passed: metaRobotsContent ? !/noindex|none/i.test(metaRobotsContent) : true,
      description: metaRobotsContent ? `Meta robots: ${metaRobotsContent}` : "No meta robots (OK)",
      weight: WEIGHTS.meta_robots,
    },
    {
      key: "canonical",
      name: "Canonical",
      passed: !!canonicalHref,
      description: canonicalHref ? `Canonical: ${canonicalHref}` : "No canonical link",
      weight: WEIGHTS.canonical,
    },
    {
      key: "title",
      name: "Title tag",
      passed: !!titleText,
      description: titleText ? `Title: ${titleText}` : "Missing <title>",
      weight: WEIGHTS.title,
    },
    {
      key: "meta_description",
      name: "Meta description",
      passed: !!metaDescription,
      description: metaDescription ? `Description: ${metaDescription}` : "Missing meta description",
      weight: WEIGHTS.meta_description,
    },
    {
      key: "og_title",
      name: "OG title",
      passed: !!ogTitle,
      description: ogTitle ? "og:title present" : "Missing og:title",
      weight: WEIGHTS.og_title,
    },
    {
      key: "og_description",
      name: "OG description",
      passed: !!ogDesc,
      description: ogDesc ? "og:description present" : "Missing og:description",
      weight: WEIGHTS.og_description,
    },
    {
      key: "h1",
      name: "H1",
      passed: haveH1,
      description: haveH1 ? "<h1> found" : "Missing <h1>",
      weight: WEIGHTS.h1,
    },
    {
      key: "structured_data",
      name: "Structured data (JSON-LD)",
      passed: haveJsonLd,
      description: haveJsonLd ? "JSON-LD present" : "No JSON-LD",
      weight: WEIGHTS.structured_data,
    },
    {
      key: "ai_instructions",
      name: "AI instructions",
      passed: haveAiMeta,
      description: haveAiMeta ? "AI directives present (meta[name=ai])" : "No AI directives meta",
      weight: WEIGHTS.ai_instructions,
    },
    {
      key: "img_alt",
      name: "Image alt",
      passed: !imgNoAlt,
      description: !imgNoAlt ? "All images have alt (or no images)" : "Some images missing alt",
      weight: WEIGHTS.img_alt,
    },
    {
      key: "favicon",
      name: "Favicon",
      passed: haveFavicon,
      description: haveFavicon ? "Favicon link found" : "No favicon link",
      weight: WEIGHTS.favicon,
    },
    {
      key: "status_redirects",
      name: "HTTP status/redirects",
      passed: statusPassed,
      description: `Status check not performed (assumed OK ${status})`,
      weight: WEIGHTS.status_redirects,
    },
  ];

  const gained = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const score = Math.max(0, Math.min(100, Math.round((gained / TOTAL_WEIGHT) * 100)));

  // Strip weight from output to keep response small
  const publicChecks = checks.map(({ weight, ...rest }) => rest);

  return { score, checks: publicChecks };
}
