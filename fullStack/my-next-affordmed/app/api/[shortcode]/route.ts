import { NextResponse } from 'next/server';
// import { db } from '@/lib/db/js';
import { db } from '@/app/lib/db';
import { Logger } from '@/app/lib/logger';

const logger = new Logger('API:Redirect');

export async function GET(
  request: Request,
  { params }: { params: { shortcode: string } }
) {
  try {
    const { shortcode } = params;
    const originalUrl = await db.getOriginalUrl(shortcode);

    if (!originalUrl) {
      logger.error('Shortcode not found', { shortcode });
      return NextResponse.json(
        { error: "Short URL not found or expired" },
        { status: 404 }
      );
    }

    logger.log('Redirecting', { shortcode, originalUrl });
    return NextResponse.redirect(originalUrl);

  } catch (error) {
    logger.error('Internal server error', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}