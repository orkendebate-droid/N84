import postgres from 'postgres'

const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')

async function run() {
  try {
    const users = await sql`SELECT id, first_name, full_name, username, telegram_id, role FROM public.profiles WHERE role = 'youth';`
    console.log(JSON.stringify(users, null, 2))
  } catch(e) {
    console.error(e)
  }
  process.exit(0)
}
run()
