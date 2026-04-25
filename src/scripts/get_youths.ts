import postgres from 'postgres'
import * as fs from 'fs'

const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')

async function run() {
  try {
    const users = await sql`SELECT id, first_name, full_name, username, telegram_id, role, address, bio FROM public.profiles WHERE role = 'youth';`
    fs.writeFileSync('youth.json', JSON.stringify(users, null, 2), 'utf8')
  } catch(e: any) {
    fs.writeFileSync('youth_error.txt', Object.toString.call(e), 'utf8')
  }
  process.exit(0)
}
run()
