// lib/analyze.ts
import {
  QUICK_KEYS,
  PRO_KEYS,
  weightOf,
  nameOf,
  interpret,
  CheckKey,
  Mode,
} from "./score";

export interface CheckItem {
  key: CheckKey;
  name: string;
  passed: boolean;
  description: string;
}

export interface AnalyzeResult {
  url: string;
  mode: Mode;
  items: CheckItem[];
  score: number; // same for quick & pro (weighted over all 15)
  interpretation: ReturnType<typeof interpret>;
}

const DEFAULT_UA =
  "Mozilla/5.0 (compatible; AIVCheckBot/1.0; +https://aivcheck.com)";

export async function analyze(rawUrl: string, mode: Mode): Promise<AnalyzeResult> {
  const { origin, url } = normalizeUrl(rawUrl);
  const { html, headers, schemeOk } = await fetchHTML(url);

  // run all 15 checks once
  const all: Record<CheckKey, CheckItem> = {
    robots_txt: await checkRobotsTxt(origin),
    sitemap_xml: await checkSitemap(origin),
    x_robots_tag: checkXRobots(headers),
    meta_robots: checkMetaRobots(html),
    canonical: checkCanonical(html, origin),
    title_tag: checkTitle(html),
    meta_description: checkMetaDescription(html),
    open_graph: checkOpenGraph(html),
    h1_present: checkH1(html),
    structured_data: checkJSONLD(html),
    mobile_friendly: checkViewport(html),
    https: {
      key: "https",
      name: nameOf("https"),
      passed: schemeOk,
      description: schemeOk ? "HTTPS detected" : "Page is not served via HTTPS",
    },
    alt_attributes: checkAltAttributes(html),
    favicon: await checkFavicon(html, origin),
    page_404: await check404(origin),
  };

  // score is always based on all 15 weights
  const score = calcWeightedScore(all);

  // items to display
  const keysToShow = mode === "quick" ? QUICK_KEYS : PRO_KEYS;
  const items = keysToShow.map((k) => all[k]);

  return {
    url,
    mode,
    items,
    score,
    interpretation: interpret(score),
  };
}

/* ---------- scoring ---------- */
function calcWeightedScore(all: Record<CheckKey, CheckItem>): number {
  const total = PRO_KEYS.reduce((a, k) => a + weightOf(k), 0); // = 100
  const pass = PRO_KEYS.reduce((a, k) => a + (all[k].passed ? weightOf(k) : 0), 0);
  return Math.round((pass / total) * 100);
}

/* ---------- helpers ---------- */
function normalizeUrl(input: string): { origin: string; url: string } {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  const urlObj = new URL(u);
  return { origin: urlObj.origin, url: urlObj.toString() };
}

async function fetchWithTimeout(
  resource: string,
  opts: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 12000, ...rest } = opts;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(resource, {
      ...rest,
      redirect: "follow",
      headers: { "user-agent": DEFAULT_UA, ...(rest.headers || {}) },
      signal: controller.signal,
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchHTML(
  url: string
): Promise<{ html: string | null; headers: Headers; schemeOk: boolean }> {
  const res = await fetchWithTimeout(url);
  const schemeOk = url.startsWith("https://") && res.ok;
  const html = res.ok ? await res.text() : null;
  return { html, headers: res.headers, schemeOk };
}

/* ---------- simple HTML checks (regex-based) ---------- */
function textMatch(html: string | null, re: RegExp) {
  if (!html) return null;
  const m = html.match(re);
  return m ? m[1] || m[0] : null;
}
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "").trim();
}

async function checkRobotsTxt(origin: string): Promise<CheckItem> {
  const url = origin + "/robots.txt";
  try {
    const res = await fetchWithTimeout(url, { method: "GET" });
    if (!res.ok) return item("robots_txt", false, "robots.txt not found");
    const text = await res.text();
    const blocksAll =
      /Disallow:\s*\/\s*$/im.test(text) ||
      /User-agent:\s*\*\s*[\r\n]+Disallow:\s*\/\s*$/im.test(text);
    return item(
      "robots_txt",
      !blocksAll,
      blocksAll ? "robots.txt blocks all" : "robots.txt present and not blocking all"
    );
  } catch {
    return item("robots_txt", false, "robots.txt not accessible");
  }
}

async function checkSitemap(origin: string): Promise<CheckItem> {
  const paths = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"];
  for (const p of paths) {
    try {
      const res = await fetchWithTimeout(origin + p, { method: "GET" });
      if (res.ok) return item("sitemap_xml", true, `Found ${p}`);
    } catch {}
  }
  return item("sitemap_xml", false, "Sitemap not found");
}

function checkXRobots(headers: Headers): CheckItem {
  const v = headers.get("x-robots-tag") || "";
  const blocked = /\bnoindex\b|\bnone\b/i.test(v);
  return item("x_robots_tag", !blocked, v ? `X-Robots-Tag: ${v}` : "No X-Robots-Tag header (ok)");
}

function checkMetaRobots(html: string | null): CheckItem {
  const content =
    textMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i) || "";
  const blocked = /\bnoindex\b|\bnone\b/i.test(content);
  return item("meta_robots", !blocked, content ? `meta robots: ${content}` : "No meta robots (ok)");
}

function checkCanonical(html: string | null, origin: string): CheckItem {
  const href =
    textMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) || "";
  const ok = !!href;
  const abs = /^https?:\/\//i.test(href);
  const sameOrigin = abs ? href.startsWith(origin) : true;
  return item("canonical", ok && sameOrigin, ok ? `canonical: ${href}` : "No canonical link");
}

function checkTitle(html: string | null): CheckItem {
  const t = stripTags(textMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || "");
  return item("title_tag", t.length > 0, t.length ? `Title: ${truncate(t, 120)}` : "Missing <title>");
}

function checkMetaDescription(html: string | null): CheckItem {
  const d =
    textMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) || "";
  return item(
    "meta_description",
    d.trim().length > 0,
    d ? `Meta description: ${truncate(d, 160)}` : "Missing meta description"
  );
}

function checkOpenGraph(html: string | null): CheckItem {
  const t =
    textMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) || "";
  const d =
    textMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) || "";
  const ok = !!t && !!d;
  return item("open_graph", ok, ok ? "og:title & og:description found" : "Missing Open Graph tags");
}

function checkH1(html: string | null): CheckItem {
  const h1 = stripTags(textMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || "");
  return item("h1_present", h1.length > 0, h1 ? `H1: ${truncate(h1, 120)}` : "Missing H1");
}

function checkJSONLD(html: string | null): CheckItem {
  if (!html) return item("structured_data", false, "No JSON-LD structured data");
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ok = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const txt = m[1];
      const json = JSON.parse(txt);
      if (json) { ok = true; break; }
    } catch {}
  }
  return item("structured_data", ok, ok ? "Valid JSON-LD present" : "No JSON-LD structured data");
}

function checkViewport(html: string | null): CheckItem {
  const v =
    textMatch(html, /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["'][^>]*>/i) || "";
  const ok = /width\s*=\s*device-width/i.test(v);
  return item("mobile_friendly", ok, ok ? `viewport: ${v}` : "Missing/invalid viewport meta");
}

function checkAltAttributes(html: string | null): CheckItem {
  if (!html) return item("alt_attributes", true, "No images on page");
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const total = imgTags.length;
  if (!total) return item("alt_attributes", true, "No images on page");
  let withAlt = 0;
  for (const tag of imgTags) {
    const alt = (tag.match(/alt\s*=\s*["']([^"']*)["']/i) || [,""])[1].trim();
    if (alt.length > 0) withAlt++;
  }
  const ratio = withAlt / total;
  const ok = ratio >= 0.6;
  return item("alt_attributes", ok, `Images with alt: ${withAlt}/${total} (${Math.round(ratio * 100)}%)`);
}

async function checkFavicon(html: string | null, origin: string): Promise<CheckItem> {
  const linkHref =
    textMatch(html, /<link[^>]+rel=["'](?:shortcut\s+icon|icon)["'][^>]+href=["']([^"']+)["'][^>]*>/i) || "";
  if (linkHref) return item("favicon", true, `Icon: ${linkHref}`);
  try {
    const res = await fetchWithTimeout(origin + "/favicon.ico", { method: "HEAD" });
    const ok = res.ok;
    return item("favicon", ok, ok ? "/favicon.ico found" : "No favicon");
  } catch {
    return item("favicon", false, "No favicon");
  }
}

async function check404(origin: string): Promise<CheckItem> {
  const url = `${origin}/__aivcheck_not_found_${Date.now().toString(36)}.html`;
  try {
    const res = await fetchWithTimeout(url, { method: "GET" });
    const text = await res.text();
    const hint = /404/i.test(text) || /not found/i.test(text);
    const ok = res.status === 404 || hint;
    return item("page_404", ok, ok ? "Proper 404 response" : `Unexpected status ${res.status}`);
  } catch {
    return item("page_404", false, "404 check failed (network)");
  }
}

/* ---------- utils ---------- */
function item(key: CheckKey, passed: boolean, description: string): CheckItem {
  return { key, name: nameOf(key), passed, description };
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
