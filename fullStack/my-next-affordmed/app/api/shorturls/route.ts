import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
// import { Logger } from '@/lib/logger';
import { Logger } from '@/app/lib/logger';
// import { isValidUrl, generateShortcode, isValidShortcode } from '@app/lib/utils';
import { isValidUrl, generateShortcode, isValidShortcode } from '@/app/lib/util';

const logger = new Logger('API:ShortUrls');

export async function POST(request: Request) {
  try {
    const { url, validity, shortcode } = await request.json();
    if (!url) {
      logger.error('Validation failed', { error: 'URL is required' });
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      logger.error('Validation failed', { error: 'Invalid URL format', url });
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    if (validity && (!Number.isInteger(validity) || validity <= 0)) {
      logger.error('Validation failed', { error: 'Invalid validity', validity });
      return NextResponse.json(
        { error: "Validity must be a positive integer" },
        { status: 400 }
      );
    }

    let finalShortcode = shortcode;
    if (finalShortcode) {
      if (!isValidShortcode(finalShortcode)) {
        logger.error('Validation failed', { error: 'Invalid shortcode format', shortcode });
        return NextResponse.json(
          { error: "Shortcode must be 4-20 alphanumeric characters" },
          { status: 400 }
        );
      }

      if (await db.shortcodeExists(finalShortcode)) {
        logger.error('Shortcode conflict', { shortcode: finalShortcode });
        return NextResponse.json(
          { error: "Shortcode already exists" },
          { status: 409 }
        );
      }
    } else {
      finalShortcode = generateShortcode();
      logger.log('Generated shortcode', { shortcode: finalShortcode });
    }

    // Create the short URL
    const validityMinutes = validity || 30; // default 30 minutes
    await db.createShortUrl(url, validityMinutes, finalShortcode);

    const shortUrl = `${process.env.BASE_URL}/${finalShortcode}`;

    logger.log('Short URL created', { shortUrl, originalUrl: url });

    return NextResponse.json(
      {
        shortUrl,
        shortcode: finalShortcode,
        expiresAt: new Date(Date.now() + validityMinutes * 60000).toISOString()
      },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Internal server error', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}