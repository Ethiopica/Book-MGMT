import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (adminEmail && user.email?.toLowerCase() !== adminEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const userId = body?.userId;
  if (!userId || typeof userId !== 'string') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  if (!supabaseServiceKey) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const { error } = await adminClient
    .from('profiles')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
