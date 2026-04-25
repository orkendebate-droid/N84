const postgres = require('postgres');
const fs = require('fs');

const sql = postgres('postgresql://postgres.fmweyzcdippvfcsmwnqt:%253wA.B+j6Yfq%25Fx@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');

async function run() {
  try {
    const authUsers = await sql`SELECT id, email, phone, raw_user_meta_data FROM auth.users;`;
    const profiles = await sql`SELECT * FROM public.profiles;`;
    
    fs.writeFileSync('c:/Users/user/Desktop/F84/db_state.json', JSON.stringify({ authUsers, profiles }, null, 2), 'utf8');
  } catch(e) {
    fs.writeFileSync('c:/Users/user/Desktop/F84/db_error.txt', e.toString(), 'utf8');
  }
  process.exit(0);
}
run();
