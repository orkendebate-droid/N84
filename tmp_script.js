const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('profiles').select('id, telegram_id, username, full_name, role');
  const fs = require('fs');
  fs.writeFileSync('profiles_out.json', JSON.stringify(data, null, 2), 'utf-8');
}
run();
