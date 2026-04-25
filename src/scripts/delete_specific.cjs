const postgres = require('postgres');

const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres');

async function run() {
  try {
    const res = await sql`DELETE FROM public.profiles WHERE id = '46ec648f-a749-421a-9e09-faba34ad0b6b';`;
    console.log("Deleted!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
