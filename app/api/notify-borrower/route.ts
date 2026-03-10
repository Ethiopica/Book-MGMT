import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Church Library <onboarding@resend.dev>';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, bookTitle, borrowerName } = body;

  if (!email || typeof email !== 'string' || !bookTitle || typeof bookTitle !== 'string') {
    return NextResponse.json(
      { error: 'Missing email or bookTitle' },
      { status: 400 }
    );
  }

  const name = typeof borrowerName === 'string' && borrowerName.trim() ? borrowerName.trim() : 'Borrower';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set; skipping borrower notification email.');
    return NextResponse.json({ sent: false, reason: 'not_configured' });
  }

  const resend = new Resend(resendApiKey);

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: `Book borrowed: ${bookTitle}`,
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>This is a confirmation that you have borrowed the following book from the church library:</p>
      <p><strong>${escapeHtml(bookTitle)}</strong></p>
      <p>Please return it when you are done. Thank you!</p>
    `,
  });

  if (error) {
    console.error('Notify borrower email error:', error);
    // Resend free tier: you can only send to your own email until you verify a domain.
    const isDomainNotVerified =
      (error as { statusCode?: number; name?: string }).statusCode === 403 ||
      (error as { name?: string }).name === 'validation_error';
    if (isDomainNotVerified) {
      return NextResponse.json({
        sent: false,
        reason: 'domain_not_verified',
        message: 'Verify a domain at resend.com/domains and set RESEND_FROM_EMAIL to send to borrowers.',
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, id: data?.id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
