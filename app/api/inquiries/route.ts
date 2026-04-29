import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sendInquiryEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json([], { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();

    if (!name || (!phone && !email)) {
      return NextResponse.json({ message: 'Please provide your name and at least one contact method.' }, { status: 400 });
    }

    await sendInquiryEmail({
      name,
      company: String(body.company || '').trim(),
      phone,
      email,
      productInterest: String(body.productInterest || '').trim(),
      message: String(body.message || '').trim(),
      pageUrl: String(body.pageUrl || '').trim(),
      pageType: String(body.pageType || '').trim(),
      productTitle: String(body.productTitle || '').trim(),
      productUrl: String(body.productUrl || '').trim(),
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Inquiry sent successfully' }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('[inquiry] email send failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Unable to send inquiry right now. Please call or WhatsApp us.' }, { status: 500 });
  }
}
