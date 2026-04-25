const postgres = require('postgres');

const sql = postgres('postgresql://postgres.fmweyzcdippvfcsmwnqt:%253wA.B+j6Yfq%25Fx@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');

const fs = require('fs');
async function run() {
  try {
    // Query auth users to find Mūstafa Aqbota
    const result = await sql`SELECT id, email, raw_user_meta_data FROM auth.users;`;
    fs.writeFileSync('c:/Users/user/Desktop/F84/delete_result.txt', JSON.stringify(result, null, 2), 'utf8');
  } catch(e) {
    fs.writeFileSync('c:/Users/user/Desktop/F84/delete_result.txt', 'Ошибка: ' + e.toString(), 'utf8');
  }
  process.exit(0);
}
run();
