export const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "signup",
  "auth",
  "admin",
  "api",
  "_next",
  "static",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
