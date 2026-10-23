import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry } from '@/models/Inquiry';
import { verifyToken } from '@/lib/auth';
import { sendInquiryConfirmationEmail, sendInquiryEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(inquiries)), { headers: NO_STORE });
  } catch (error) {
    console.error('[inquiry] list failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Unable to load inquiries right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim();

  if (!name || (!phone && !email)) {
    return NextResponse.json({ message: 'Please provide your name and at least one contact method.' }, { status: 400 });
  }

  const payload = {
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
  };

  // The enquiry is recorded before any mail is attempted. Previously nothing was
  // stored at all, so a failed send meant the lead was lost with no trace.
  let stored = false;
  try {
    await connectDB();
    await Inquiry.create({
      name: payload.name,
      company: payload.company,
      phone: payload.phone,
      email: payload.email,
      productInterest: payload.productTitle || payload.productInterest,
      message: payload.message,
      status: 'new',
    });
    stored = true;
  } catch (error) {
    console.error('[inquiry] could not store inquiry:', error instanceof Error ? error.message : error);
  }

  let notified = false;
  try {
    await sendInquiryEmail(payload);
    notified = true;
  } catch (error) {
    console.error('[inquiry] notification email failed:', error instanceof Error ? error.message : error);
  }

  // Best effort: the submitter's acknowledgement must never decide the outcome.
  try {
    await sendInquiryConfirmationEmail(payload);
  } catch (error) {
    console.error('[inquiry] confirmation email failed:', error instanceof Error ? error.message : error);
  }

  if (!stored && !notified) {
    return NextResponse.json(
      { message: 'Unable to send inquiry right now. Please call or WhatsApp us.' },
      { status: 500, headers: NO_STORE }
    );
  }

  return NextResponse.json({ message: 'Inquiry sent successfully' }, { headers: NO_STORE });
}
