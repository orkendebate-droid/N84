import postgres from 'postgres'

const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')

async function run() {
  try {
    await sql`ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS short_description TEXT;`
    console.log('Added short_description')
  } catch(e) {
    console.error(e)
  }
  process.exit(0)
}
run()
