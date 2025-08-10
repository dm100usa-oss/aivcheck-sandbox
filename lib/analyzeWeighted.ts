import * as cheerio from "cheerio";
import { WEIGHTS, TOTAL_WEIGHT, type CheckKey } from "./score";
import type { CheckResult } from "./types";

const TIMEOUT_MS = 15000;

function normUrl(input: string) {
  const s = input.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

async function head(url: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function get(url: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    if (!res.ok) return { ok: false, status: res.status, text: "" };
    const text = await res.text();
    return { ok: true, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  } finally {
    clearTimeout(t);
  }
}

function interpret(score: number): "Low" | "Moderate" | "Good" | "Excellent" {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Low";
}

export async function analyzeWeighted(rawUrl: string): Promise<{
  results: CheckResult[];
  score: number;
  interpretation: ReturnType<typeof interpret>;
}> {
  const url = normUrl(rawUrl);

  const headRes = await head(url);
  const statusOk = !!headRes && headRes.ok;
  const status = headRes?.status ?? 0;

  const getRes = await get(url);
  const htmlOk = getRes.ok && !!getRes.text;
  const $ = htmlOk ? cheerio.load(getRes.text) : cheerio.load("");

  const hasTag = (selector: string) => $(selector).length > 0;
  const getAttr = (selector: string, attr: string) => $(selector).attr(attr) ?? "";

  const robotsUrl = new URL("/robots.txt", url).toString();
  const robotsRes = await get(robotsUrl);
  const robotsTxtPassed = robotsRes.ok && robotsRes.text.length > 0;

  const sitemapUrl = new URL("/sitemap.xml", url).toString();
  const sitemapRes = await get(sitemapUrl);
  const sitemapXmlPassed = sitemapRes.ok;

  const xRobotsHeader = headRes?.headers.get("x-robots-tag") || "";
  const xRobotsPassed = !/noindex|none/i.test(xRobotsHeader);

  const metaRobotsContent = getAttr('meta[name="robots"]', "content");
  const metaRobotsPassed = metaRobotsContent ? !/noindex|none/i.test(metaRobotsContent) : true;

  const canonicalHref = getAttr('link[rel="canonical"]', "href");
  const canonicalPassed = !!canonicalHref;

  const titleText = $("title").first().text().trim();
  const titlePassed = titleText.length > 0;

  const metaDesc = getAttr('meta[name="description"]', "content").trim();
  const metaDescPassed = metaDesc.length > 0;

  const ogTitle = getAttr('meta[property="og:title"]', "content").trim();
  const ogTitlePassed = ogTitle.length > 0;
  const ogDesc = getAttr('meta[property="og:description"]', "content").trim();
  const ogDescPassed = ogDesc.length > 0;

  const h1Passed = hasTag("h1");

  const jsonLdScripts = $('script[type="application/ld+json"]');
  const structuredDataPassed = jsonLdScripts.length > 0;

  const metaAi = getAttr('meta[name="ai"]', "content").trim();
  let aiTxtPassed = false;
  if (metaAi) {
    aiTxtPassed = true;
  } else {
    const aiTxtUrl = new URL("/.well-known/ai.txt", url).toString();
    const aiTxtRes = await get(aiTxtUrl);
    aiTxtPassed = aiTxtRes.ok && aiTxtRes.text.length > 0;
  }

  const imgs = $("img");
  let imgAltPassed = true;
  if (imgs.length > 0) {
    imgAltPassed = imgs.filter((_, el) => !$(el).attr("alt")).length === 0;
  }

  const hasFavicon =
    !!getAttr('link[rel="icon"]', "href") ||
    !!getAttr('link[rel="shortcut icon"]', "href") ||
    !!getAttr('link[rel="apple-touch-icon"]', "href");
  const faviconPassed = hasFavicon;

  const statusPassed = statusOk && status >= 200 && status < 400;

  const items: CheckResult[] = [
    { key: "robots_txt", name: "robots.txt", passed: robotsTxtPassed, description: robotsTxtPassed ? "robots.txt is present" : "robots.txt missing or not accessible" },
    { key: "sitemap_xml", name: "sitemap.xml", passed: sitemapXmlPassed, description: sitemapXmlPassed ? "sitemap.xml found" : "sitemap.xml missing" },
    { key: "x_robots_tag", name: "X-Robots-Tag (header)", passed: xRobotsPassed, description: xRobotsHeader ? `X-Robots-Tag: ${xRobotsHeader}` : "No X-Robots-Tag header (OK)" },
    { key: "meta_robots", name: "Meta robots", passed: metaRobotsPassed, description: metaRobotsContent ? `Meta robots: ${metaRobotsContent}` : "No meta robots (OK)" },
    { key: "canonical", name: "Canonical", passed: canonicalPassed, description: canonicalPassed ? `Canonical: ${canonicalHref}` : "No canonical link" },
    { key: "title", name: "Title tag", passed: titlePassed, description: titlePassed ? `Title: ${titleText}` : "Missing <title>" },
    { key: "meta_description", name: "Meta description", passed: metaDescPassed, description: metaDescPassed ? `Description: ${metaDesc.slice(0, 160)}` : "Missing meta description" },
    { key: "og_title", name: "OG title", passed: ogTitlePassed, description: ogTitlePassed ? "og:title present" : "Missing og:title" },
    { key: "og_description", name: "OG description", passed: ogDescPassed, description: ogDescPassed ? "og:description present" : "Missing og:description" },
    { key: "h1", name: "H1", passed: h1Passed, description: h1Passed ? "<h1> found" : "Missing <h1>" },
    { key: "structured_data", name: "Structured data (JSON-LD)", passed: structuredDataPassed, description: structuredDataPassed ? "JSON-LD present" : "No JSON-LD" },
    { key: "ai_instructions", name: "AI instructions", passed: aiTxtPassed, description: aiTxtPassed ? "AI directives present (meta or .well-known/ai.txt)" : "No AI directives found" },
    { key: "img_alt", name: "Image alt", passed: imgAltPassed, description: imgAltPassed ? "All images have alt (or no images)" : "Some images missing alt" },
    { key: "favicon", name: "Favicon", passed: faviconPassed, description: faviconPassed ? "Favicon link found" : "No favicon link" },
    { key: "status_redirects", name: "HTTP status/redirects", passed: statusPassed, description: statusOk ? `Status: ${status}` : "HEAD failed" },
  ];

  let score = 0;
  for (const it of items) {
    const k = (it.key as CheckKey);
    if (k in WEIGHTS && it.passed) score += WEIGHTS[k];
  }
  const finalScore = Math.max(0, Math.min(100, Math.round((score / TOTAL_WEIGHT) * 100)));

  return {
    results: items,
    score: finalScore,
    interpretation: interpret(finalScore),
  };
}
