import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (adminEmail && user.email.toLowerCase() !== adminEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!supabaseServiceKey) return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await adminClient
    .from('lending_requests')
    .select('id, book_id, first_name, last_name, email, phone, address, notes, status, requested_at, books(title, author)')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
