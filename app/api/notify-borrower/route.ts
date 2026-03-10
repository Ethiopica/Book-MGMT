import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const gmailUser = process.env.EMAIL_USER;
const gmailPass = process.env.EMAIL_PASS;
const fromEmail = process.env.NOTIFY_FROM_EMAIL || gmailUser || '';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, bookTitle, borrowerName } = body;

  if (!email || typeof email !== 'string' || !bookTitle || typeof bookTitle !== 'string') {
    return NextResponse.json(
      { error: 'Missing email or bookTitle' },
      { status: 400 }
    );
  }

  if (!gmailUser || !gmailPass || !fromEmail) {
    console.warn('Gmail SMTP not configured (EMAIL_USER / EMAIL_PASS / NOTIFY_FROM_EMAIL). Skipping borrower notification.');
    return NextResponse.json({ sent: false, reason: 'not_configured' });
  }

  const name = typeof borrowerName === 'string' && borrowerName.trim() ? borrowerName.trim() : 'ውድ አከባቢ አባል';

  const html = `
<!doctype html>
<html lang="am">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ማስታወሻ</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.12);">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#e5e7eb;">
                <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:700;">የመጽሃፍ መመለሻ ማስታወሻ</h1>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#cbd5f5;">
                  በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የፊንላንድ ሄልሲንኪ ደብረ አሚን አቡነ ተክለሃይማኖት ቤተክርስቲያን 
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 8px 24px;color:#111827;font-size:14px;line-height:1.7;">
                <p style="margin:0 0 12px 0;">ሰላም ${escapeHtml(name)}፣</p>
                <p style="margin:0 0 12px 0;">
                  ከቤተክርስቲያናችን የተዋሱት መጽሃፍ የመመለሻ ጊዜው ስለተቃረበ ወይንም ስላለፈ እባክዎ በተቻለ ፍጥነት ወደ ቤተክርስቲያን እንዲመለስ ያድርጉልን።
                </p>
                <div style="margin:16px 0;padding:12px 14px;border-radius:10px;background-color:#eff6ff;border:1px solid #bfdbfe;">
                  <p style="margin:0;font-size:13px;color:#1d4ed8;">
                    <strong style="display:block;font-size:14px;color:#1e40af;">የተዋሰው መጽሃፍ</strong>
                    ${escapeHtml(bookTitle)}
                  </p>
                </div>
                <p style="margin:0 0 12px 0;">
                  መጽሃፉን በጊዜ በመመለስ ለሌሎችም ተገልጋዮች የማንበብ እድል ያፈጥራል። ወደፊት ሌሎች መጽሃፍት ለመዋስ እንዲችሉም ያግዛል።
                </p>
                <p style="margin:0 0 16px 0;">
                  መጽሃፉን መመለስ የማይችሉበት ጉዳይ ካጋጠመዎት የክፍሉን ተወካይ ያነጋግሩ።
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 18px 24px;background-color:#f9fafb;color:#6b7280;font-size:12px;line-height:1.6;">
                <p style="margin:0 0 4px 0;">
                  ስለ ትብብርዎ እናመሰግናለን።
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    await transporter.sendMail({
      to: email,
      from: fromEmail,
      subject: `Book borrowed: ${bookTitle}`,
      html,
    });
    return NextResponse.json({ sent: true });
  } catch (error: any) {
    console.error('Notify borrower email error (Gmail SMTP):', error);
    const message = error?.message || 'Failed to send email';
    // Keep 200 so the front-end treats this as a soft failure
    return NextResponse.json(
      { sent: false, reason: 'send_failed', error: message },
      { status: 200 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
