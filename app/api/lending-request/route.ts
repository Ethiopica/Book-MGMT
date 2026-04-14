import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const {
    bookId,
    firstName,
    lastName,
    email,
    phone,
    address,
    notes,
  } = body;

  if (!bookId || !firstName || !lastName || !email || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: activeLoan, error: activeLoanError } = await adminClient
    .from('loans')
    .select('id')
    .eq('book_id', bookId)
    .eq('status', 'borrowed')
    .maybeSingle();
  if (activeLoanError) return NextResponse.json({ error: activeLoanError.message }, { status: 500 });
  if (activeLoan) return NextResponse.json({ error: 'Book is already borrowed' }, { status: 409 });

  const { error } = await adminClient.from('lending_requests').insert({
    book_id: String(bookId),
    first_name: String(firstName).trim(),
    last_name: String(lastName).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    address: typeof address === 'string' ? address.trim() || null : null,
    notes: typeof notes === 'string' ? notes.trim() || null : null,
    status: 'pending',
    requested_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
