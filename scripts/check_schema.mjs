const url = 'https://fmweyzcdippvfcsmwnqt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtd2V5emNkaXBwdmZjc213bnF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1NzE1MSwiZXhwIjoyMDkyNTMzMTUxfQ.Gz1H0WKEDiTFKzmrr_fzO7SSB2WbEyXhMtekksfxmYM';

// Колонки, которые ожидаем по schema.sql
const expected = {
  profiles:     ['id','telegram_id','username','full_name','first_name','role','is_verified','otp_code','address','bio','company_name','bin_iin','industry','link','user_age','embedding','created_at','updated_at'],
  vacancies:    ['id','employer_id','title','description','salary','area','requirements','employment_type','industry','embedding','created_at','is_active'],
  applications: ['id','vacancy_id','youth_id','status','match_score','created_at'],
};

for (const table of Object.keys(expected)) {
  const r = await fetch(`${url}/rest/v1/${table}?limit=1`, {
    headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' }
  });

  const body = await r.json().catch(() => null);

  if (!r.ok) {
    console.log(`\n❌ [${table}] HTTP ${r.status}: ${JSON.stringify(body)}`);
    continue;
  }

  const actual = Array.isArray(body) && body.length > 0 ? Object.keys(body[0]) : null;

  if (!actual) {
    console.log(`\n⚠️  [${table}] таблица пуста — колонки не видны через REST`);
    console.log(`   Ожидаем: ${expected[table].join(', ')}`);
    continue;
  }

  const missing  = expected[table].filter(c => !actual.includes(c));
  const extra    = actual.filter(c => !expected[table].includes(c));

  console.log(`\n✅ [${table}] (${r.headers.get('content-range')})`);
  console.log(`   Реальные колонки: ${actual.join(', ')}`);
  if (missing.length > 0) console.log(`   ⚠️  ОТСУТСТВУЮТ в БД: ${missing.join(', ')}`);
  if (extra.length > 0)   console.log(`   ➕ ЛИШНИЕ в БД (не в schema.sql): ${extra.join(', ')}`);
  if (missing.length === 0 && extra.length === 0) console.log('   ✔ Схема совпадает!');
}
