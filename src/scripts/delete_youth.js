import postgres from 'postgres'

const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')

async function run() {
  try {
    console.log('Deleting youth profiles...');
    const result = await sql`DELETE FROM public.profiles WHERE role = 'youth' RETURNING *;`
    console.log(`Deleted ${result.length} youth profile(s).`);
  } catch(e) {
    console.error(e)
  }
  process.exit(0)
}
run()
