/**
 * Universal SEO-friendly slug generator for articles, categories, listings and pages.
 * - Strips leading/trailing dashes and whitespace
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses consecutive hyphens
 * - Converts to lowercase
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}
