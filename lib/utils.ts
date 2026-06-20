const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateSlug(): string {
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
