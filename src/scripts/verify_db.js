const postgres = require('postgres');
const fs = require('fs');
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
});

async function verify() {
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birthday';
  `;
  const result = columns.length > 0 
    ? `COLUMN: ${columns[0].column_name}, TYPE: ${columns[0].data_type}`
    : 'COLUMN NOT FOUND';
  
  fs.writeFileSync('verification.txt', result);
  process.exit(0);
}
verify();
