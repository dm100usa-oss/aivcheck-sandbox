// lib/analyzeWeighted.ts
// Named export — REQUIRED by our API route.
export async function analyzeWeighted(url: string): Promise<{
  score: number;
  interpretation: "Poor" | "Moderate" | "Good" | "Excellent";
  checks: Array<{ key: string; name: string; passed: boolean; description: string }>;
}> {
  const target = new URL(url);
  const origin = target.origin;

  // Helpers
  const timeoutMs = 12000;
  const fetchText = async (u: string) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(u, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "AI-Visibility-Pro/1.0 (+https://aivcheck.com)" },
        signal: ctrl.signal,
      });
      const text = await res.text().catch(() => "");
      return { ok: res.ok, status: res.status, headers: res.headers, text };
    } finally {
      clearTimeout(t);
    }
  };

  const exists = (html: string, re: RegExp) => re.test(html);
  const pick = (html: string, re: RegExp) => {
    const m = html.match(re);
    return m ? m[1] ?? m[0] : "";
  };

  // Fetch main page once
  const main = await fetchText(target.toString());
  const html = main.text || "";

  // Secondary fetches (best-effort, non-fatal)
  const [robots, sitemap, faviconIco] = await Promise.all([
    fetchText(`${origin}/robots.txt`).catch(() => ({ ok: false, status: 0, headers: new Headers(), text: "" })),
    fetchText(`${origin}/sitemap.xml`).catch(() => ({ ok: false, status: 0, headers: new Headers(), text: "" })),
    fetchText(`${origin}/favicon.ico`).catch(() => ({ ok: false, status: 0, headers: new Headers(), text: "" })),
  ]);

  // Checks
  const checks: Array<{ key: string; name: string; passed: boolean; description: string }> = [];

  // 1) robots.txt
  {
    const passed = robots.ok && robots.status >= 200 && robots.status < 400 && (robots.text || "").length > 0;
    checks.push({
      key: "robots_txt",
      name: "robots.txt",
      passed,
      description: passed ? "robots.txt is present" : "robots.txt is missing",
    });
  }

  // 2) sitemap.xml (or declared in robots)
  {
    const inRobots = /Sitemap:\s*https?:\/\/\S+/i.test(robots.text || "");
    const looksLikeSitemap = /<\s*(urlset|sitemapindex)\b/i.test(sitemap.text || "");
    const passed = (sitemap.ok && sitemap.status >= 200 && sitemap.status < 400 && looksLikeSitemap) || inRobots;
    checks.push({
      key: "sitemap_xml",
      name: "sitemap.xml",
      passed,
      description: passed ? "sitemap.xml found (or declared in robots.txt)" : "sitemap.xml not found",
    });
  }

  // 3) X-Robots-Tag (header) — must not be noindex/none
  {
    const xr = main.headers.get("x-robots-tag") || "";
    const blocked = /\b(noindex|none)\b/i.test(xr);
    const passed = !blocked;
    checks.push({
      key: "x_robots",
      name: "X-Robots-Tag (header)",
      passed,
      description: passed ? "Indexing allowed (no blocking X-Robots-Tag)" : `Blocked by X-Robots-Tag: ${xr}`,
    });
  }

  // 4) Meta robots — must not be noindex/none
  {
    const robotsMeta = pick(
      html,
      /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    const blocked = /\b(noindex|none)\b/i.test(robotsMeta);
    const passed = robotsMeta ? !blocked : true; // if absent, assume allowed
    checks.push({
      key: "meta_robots",
      name: "Meta robots",
      passed,
      description: robotsMeta
        ? passed
          ? `robots: ${robotsMeta}`
          : `blocked: ${robotsMeta}`
        : "no <meta name=\"robots\"> (treated as allowed)",
    });
  }

  // 5) Canonical
  {
    const canonical = pick(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const passed = !!canonical;
    checks.push({
      key: "canonical",
      name: "Canonical",
      passed,
      description: passed ? `canonical: ${canonical}` : "no canonical link",
    });
  }

  // 6) Title
  {
    const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i).trim();
    const passed = !!title;
    checks.push({
      key: "title",
      name: "Title tag",
      passed,
      description: passed ? `title: ${truncate(title, 80)}` : "missing <title>",
    });
  }

  // 7) Meta description
  {
    const desc = pick(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i).trim();
    const passed = !!desc;
    checks.push({
      key: "meta_description",
      name: "Meta description",
      passed,
      description: passed ? `description: ${truncate(desc, 120)}` : "missing meta description",
    });
  }

  // 8) OG title
  {
    const ogt = pick(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i).trim();
    const passed = !!ogt;
    checks.push({
      key: "og_title",
      name: "OG title",
      passed,
      description: passed ? `og:title present` : "missing og:title",
    });
  }

  // 9) OG description
  {
    const ogd = pick(
      html,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ).trim();
    const passed = !!ogd;
    checks.push({
      key: "og_description",
      name: "OG description",
      passed,
      description: passed ? `og:description present` : "missing og:description",
    });
  }

  // 10) H1
  {
    const hasH1 = exists(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/i);
    checks.push({
      key: "h1",
      name: "H1",
      passed: hasH1,
      description: hasH1 ? "<h1> found" : "missing <h1>",
    });
  }

  // 11) Structured data (JSON-LD)
  {
    const hasLd = exists(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i);
    checks.push({
      key: "json_ld",
      name: "Structured data (JSON-LD)",
      passed: hasLd,
      description: hasLd ? "JSON-LD present" : "no JSON-LD",
    });
  }

  // 12) AI instructions (heuristic)
  {
    const hasAI =
      exists(html, /<meta[^>]*name=["']ai[-:]instructions["'][^>]*content=["'][^"']+["'][^>]*>/i) ||
      exists(html, /<meta[^>]*name=["']gpt[-:]?instructions["'][^>]*content=["'][^"']+["'][^>]*>/i);
    checks.push({
      key: "ai_instructions",
      name: "AI instructions",
      passed: hasAI,
      description: hasAI ? "AI instructions meta present" : "no explicit AI instructions",
    });
  }

  // 13) Image alt attributes (simple heuristic)
  {
    const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi)).slice(0, 20).map((m) => m[0]);
    let withAlt = 0;
    for (const tag of imgs) {
      if (/alt\s*=\s*["'][^"']*["']/i.test(tag)) withAlt++;
    }
    const ratio = imgs.length ? withAlt / imgs.length : 1;
    const passed = ratio >= 0.8; // 80% or better
    checks.push({
      key: "image_alt",
      name: "Image alt",
      passed,
      description: imgs.length
        ? `${withAlt}/${imgs.length} images have alt`
        : "no images detected",
    });
  }

  // 14) Favicon
  {
    const linkTag =
      pick(html, /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i) || "";
    const hasIco = faviconIco.ok && faviconIco.status >= 200 && faviconIco.status < 400;
    const passed = !!linkTag || hasIco;
    checks.push({
      key: "favicon",
      name: "Favicon",
      passed,
      description: passed ? "favicon referenced or accessible" : "no favicon link or /favicon.ico",
    });
  }

  // 15) HTTP status / redirects
  {
    const ok = main.ok && main.status >= 200 && main.status < 400;
    checks.push({
      key: "http",
      name: "HTTP status/redirects",
      passed: ok,
      description: ok ? `status: ${main.status}` : `status: ${main.status || "unknown"}`,
    });
  }

  // Weighted score (sum to 100)
  const weights: Record<string, number> = {
    robots_txt: 8,
    sitemap_xml: 8,
    x_robots: 6,
    meta_robots: 6,
    canonical: 8,
    title: 8,
    meta_description: 8,
    og_title: 4,
    og_description: 4,
    h1: 6,
    json_ld: 10,
    ai_instructions: 6,
    image_alt: 6,
    favicon: 2,
    http: 10,
  };

  let score = 0;
  for (const c of checks) {
    const w = weights[c.key] ?? 0;
    if (c.passed) score += w;
  }

  let interpretation: "Poor" | "Moderate" | "Good" | "Excellent" = "Poor";
  if (score >= 85) interpretation = "Excellent";
  else if (score >= 70) interpretation = "Good";
  else if (score >= 50) interpretation = "Moderate";

  return {
    score,
    interpretation,
    checks,
  };
}

// utils
function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trim() + "…";
}
