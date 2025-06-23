import { Logger } from './logger';
const logger = new Logger('DB');

const urlStore = new Map<string, {
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date;
}>();

export const db = {
  async createShortUrl(originalUrl: string, validityMinutes: number, shortcode?: string) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);
    
    const entry = {
      originalUrl,
      createdAt: new Date(),
      expiresAt
    };

    urlStore.set(shortcode!, entry);
    logger.log(`Created short URL: ${shortcode} -> ${originalUrl}`);
    return shortcode!;
  },

  async getOriginalUrl(shortcode: string) {
    const entry = urlStore.get(shortcode);
    if (!entry) return null;
    
    if (new Date() > entry.expiresAt) {
      urlStore.delete(shortcode);
      logger.log(`Expired short URL deleted: ${shortcode}`);
      return null;
    }
    
    return entry.originalUrl;
  },

  async shortcodeExists(shortcode: string) {
    return urlStore.has(shortcode);
  }
};