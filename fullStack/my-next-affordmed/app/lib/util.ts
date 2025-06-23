export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateShortcode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function isValidShortcode(shortcode: string): boolean {
  return /^[a-zA-Z0-9_-]{4,20}$/.test(shortcode);
}