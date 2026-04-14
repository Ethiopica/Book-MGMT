import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
const gmailUser = process.env.EMAIL_USER;
const gmailPass = process.env.EMAIL_PASS;
const fromEmail = process.env.NOTIFY_FROM_EMAIL || gmailUser || '';
const churchName = 'በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የፊንላንድ ሄልሲንኪ ደብረ አሚን አቡነ ተክለሃይማኖት ቤተክርስቲያን';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user?.id || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (adminEmail && user.email.toLowerCase() !== adminEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const requestId = body?.requestId;
  if (!requestId || typeof requestId !== 'string') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!supabaseServiceKey) return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: reqRow, error: reqError } = await adminClient
    .from('lending_requests')
    .select('*, books(title)')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single();
  if (reqError || !reqRow) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  const { data: activeLoan } = await adminClient
    .from('loans')
    .select('id')
    .eq('book_id', reqRow.book_id)
    .eq('status', 'borrowed')
    .maybeSingle();
  if (activeLoan) return NextResponse.json({ error: 'Book is already borrowed' }, { status: 409 });

  const { data: newBorrower, error: borrowerError } = await adminClient
    .from('borrowers')
    .insert({
      first_name: reqRow.first_name,
      last_name: reqRow.last_name,
      email: reqRow.email,
      phone: reqRow.phone,
      address: reqRow.address,
    })
    .select('id')
    .single();
  if (borrowerError) return NextResponse.json({ error: borrowerError.message }, { status: 500 });

  const { error: loanError } = await adminClient.from('loans').insert({
    book_id: reqRow.book_id,
    borrower_id: newBorrower.id,
    borrowed_date: new Date().toISOString(),
    status: 'borrowed',
  });
  if (loanError) return NextResponse.json({ error: loanError.message }, { status: 500 });

  const { error: updateError } = await adminClient
    .from('lending_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', requestId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  let notificationSent = false;
  if (gmailUser && gmailPass && fromEmail && reqRow?.email) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
    const borrowerName = [reqRow.first_name, reqRow.last_name].filter(Boolean).join(' ') || 'Borrower';
    const bookTitle = reqRow?.books?.title || 'Library book';
    const borrowedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    try {
      await transporter.sendMail({
        to: reqRow.email,
        from: fromEmail,
        subject: `የመጽሃፍ ብድር ማረጋገጫ / Book borrowed: ${bookTitle}`,
        html: buildBorrowConfirmationEmail(borrowerName, bookTitle, borrowedDate),
      });
      notificationSent = true;
    } catch (mailErr) {
      console.error('Failed to send approval notification:', mailErr);
    }
  }

  return NextResponse.json({ ok: true, notificationSent });
}

function buildBorrowConfirmationEmail(name: string, bookTitle: string, borrowedDateStr: string): string {
  return `
<!doctype html>
<html lang="am">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>የብድር ማረጋገጫ</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.12);">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#0f172a,#059669);color:#e5e7eb;">
                <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:700;">የመጽሃፍ ብድር ማረጋገጫ</h1>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#a7f3d0;">${churchName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 8px 24px;color:#111827;font-size:14px;line-height:1.7;">
                <p style="margin:0 0 12px 0;">ሰላም ${escapeHtml(name)}፣</p>
                <p style="margin:0 0 12px 0;">ከቤተክርስቲያናችን ቤተ መጽሃፍ የተዋሱት መጽሃፍ ይህ ማረጋገጫ ነው።</p>
                <div style="margin:16px 0;padding:12px 14px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;">
                  <p style="margin:0;font-size:13px;color:#047857;">
                    <strong style="display:block;font-size:14px;color:#065f46;">የተዋሱት መጽሃፍ</strong>
                    ${escapeHtml(bookTitle)}
                  </p>
                  <p style="margin:8px 0 0;font-size:13px;color:#047857;">የተዋሰበት ቀን፡ ${escapeHtml(borrowedDateStr)}</p>
                </div>
                <p style="margin:0 0 12px 0;">መጽሃፉን ሲጨርሱ በተቻለ ፍጥነት ወደ ቤተክርስቲያን ቤተ መጽሃፍ ይመልሱልን። ሌሎችም እንዲያነቡ ያግዛል።</p>
                <p style="margin:0 0 16px 0;">ስለ ትብብርዎ እናመሰግናለን።</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 18px 24px;background-color:#f9fafb;color:#6b7280;font-size:12px;line-height:1.6;">
                <p style="margin:0;">ምስጋና ይሁን ለአብ ለወልድ ለመንፈስ ቅዱስ።</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
