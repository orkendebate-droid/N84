import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const status: Record<string, any> = {
    website: 'OK 🟢',
    database: 'Checking...',
    telegram: 'Checking...',
    ai: 'Checking...'
  };

  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error) throw error;
    status.database = 'OK 🟢';
  } catch(e) {
    status.database = 'Error 🔴';
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8647696284:AAGIjFctRvDYgADCtDhynLzfBt6Ys-2e_DE";
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const tgData = await tgRes.json();
    if (tgData.ok) status.telegram = 'OK 🟢';
    else status.telegram = 'Error 🔴';
  } catch(e) {
    status.telegram = 'Error 🔴';
  }

  try {
    if (process.env.QWEN_API_KEY) {
       status.ai = 'OK 🟢';
    } else {
       status.ai = 'Error (No Key) 🔴';
    }
  } catch(e) {
    status.ai = 'Error 🔴';
  }

  return NextResponse.json(status);
}
