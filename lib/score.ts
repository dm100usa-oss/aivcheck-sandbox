// lib/score.ts
export type Mode = "quick" | "pro";

export type CheckKey =
  | "robots_txt"
  | "sitemap_xml"
  | "x_robots_tag"
  | "meta_robots"
  | "canonical"
  | "title_tag"
  | "meta_description"
  | "open_graph"
  | "h1_present"
  | "structured_data"
  | "mobile_friendly"
  | "https"
  | "alt_attributes"
  | "favicon"
  | "page_404";

export interface CheckMeta {
  key: CheckKey;
  name: string;
  weight: number;
}

export const CHECKS: CheckMeta[] = [
  { key: "robots_txt",       name: "robots.txt",                 weight: 10 },
  { key: "sitemap_xml",      name: "sitemap.xml",                weight: 9  },
  { key: "x_robots_tag",     name: "X-Robots-Tag (headers)",     weight: 7  },
  { key: "meta_robots",      name: "Meta robots",                weight: 7  },
  { key: "canonical",        name: "Canonical",                  weight: 6  },
  { key: "title_tag",        name: "Title tag",                  weight: 6  },
  { key: "meta_description", name: "Meta description",           weight: 6  },
  { key: "open_graph",       name: "Open Graph",                 weight: 6  },
