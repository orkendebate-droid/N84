/**
 * N84 Platform — Full System Test Suite
 * Запуск: node src/scripts/run_tests.js
 */

const BASE_URL = 'https://n84-platform.vercel.app'
const postgres = require('postgres')

const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
})

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0, warnings = 0
const results = []

function log(status, name, detail = '') {
  const icons = { pass: '✅', fail: '❌', warn: '⚠️ ' }
  const icon = icons[status] || '?'
  const line = `${icon} ${name}${detail ? ' — ' + detail : ''}`
  console.log(line)
  results.push({ status, name, detail })
  if (status === 'pass') passed++
  else if (status === 'fail') failed++
  else warnings++
}

async function apiGet(path) {
  try {
    const r = await fetch(`${BASE_URL}${path}`)
    return { ok: r.ok, status: r.status, data: await r.json().catch(() => null) }
  } catch (e) {
    return { ok: false, status: 0, error: e.message }
  }
}

async function apiPost(path, body) {
  try {
    const r = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return { ok: r.ok, status: r.status, data: await r.json().catch(() => null) }
  } catch (e) {
    return { ok: false, status: 0, error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 1: DATABASE — Подключение к базе
// ─────────────────────────────────────────────────────────────
async function testDatabase() {
  console.log('\n🗄️  [DATABASE TESTS]')
  try {
    const tables = await sql`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `
    const names = tables.map(t => t.table_name)
    const required = ['profiles', 'vacancies', 'applications']
    for (const t of required) {
      if (names.includes(t)) log('pass', `Таблица '${t}' существует`)
      else log('fail', `Таблица '${t}' ОТСУТСТВУЕТ`)
    }
  } catch (e) {
    log('fail', 'Подключение к БД', e.message)
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 2: DATABASE SCHEMA — Все нужные колонки
// ─────────────────────────────────────────────────────────────
async function testSchema() {
  console.log('\n🔬 [SCHEMA TESTS]')
  const checks = [
    { table: 'profiles', col: 'telegram_id' },
    { table: 'profiles', col: 'username' },
    { table: 'profiles', col: 'otp_code' },
    { table: 'profiles', col: 'role' },
    { table: 'profiles', col: 'bio' },
    { table: 'profiles', col: 'address' },
    { table: 'profiles', col: 'user_age' },
    { table: 'profiles', col: 'company_name' },
    { table: 'profiles', col: 'bin_iin' },
    { table: 'profiles', col: 'industry' },
    { table: 'profiles', col: 'link' },
    { table: 'vacancies', col: 'title' },
    { table: 'vacancies', col: 'salary' },
    { table: 'vacancies', col: 'area' },
    { table: 'vacancies', col: 'employment_type' },
    { table: 'vacancies', col: 'is_active' },
    { table: 'vacancies', col: 'requirements' },
    { table: 'applications', col: 'youth_id' },
    { table: 'applications', col: 'vacancy_id' },
    { table: 'applications', col: 'match_score' },
  ]

  const cols = await sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
  `
  const colSet = new Set(cols.map(c => `${c.table_name}.${c.column_name}`))

  for (const { table, col } of checks) {
    const key = `${table}.${col}`
    if (colSet.has(key)) {
      const colInfo = cols.find(c => c.table_name === table && c.column_name === col)
      log('pass', `${key}`, `type: ${colInfo.data_type}`)
    } else {
      log('fail', `${key}`, 'КОЛОНКА ОТСУТСТВУЕТ!')
    }
  }

  // Проверяем, что birthday не DATE (блокированная колонка)
  const birthdayCol = cols.find(c => c.table_name === 'profiles' && c.column_name === 'birthday')
  if (birthdayCol && birthdayCol.data_type === 'date') {
    log('warn', 'profiles.birthday', `Тип DATE — бот НЕ использует эту колонку, используется user_age`)
  } else if (!birthdayCol) {
    log('pass', 'profiles.birthday', 'Колонка удалена — ок')
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 3: API — Список вакансий
// ─────────────────────────────────────────────────────────────
async function testVacanciesApi() {
  console.log('\n💼 [VACANCIES API TESTS]')

  const r = await apiGet('/api/vacancies/list-all')
  if (!r.ok) return log('fail', 'GET /api/vacancies/list-all', `Status: ${r.status}`)
  
  log('pass', 'GET /api/vacancies/list-all доступен')

  if (r.data?.vacancies !== undefined) {
    const count = r.data.vacancies?.length || 0
    log('pass', `Вернул массив вакансий`, `Найдено: ${count} шт.`)
    
    if (count > 0) {
      const v = r.data.vacancies[0]
      const requiredFields = ['id', 'title', 'salary', 'area', 'created_at']
      for (const f of requiredFields) {
        if (v[f] !== undefined) log('pass', `Вакансия имеет поле '${f}'`)
        else log('fail', `Вакансия НЕ имеет поле '${f}'`)
      }
    } else {
      log('warn', 'Нет вакансий в базе', 'Создайте тестовую вакансию')
    }
  } else {
    log('fail', 'Ответ не содержит vacancies', JSON.stringify(r.data))
  }

  // Тест фильтрации
  const filtered = await apiGet('/api/vacancies/list-all?area=мкр')
  if (filtered.ok && filtered.data?.success) log('pass', 'Фильтрация по area работает')
  else log('warn', 'Фильтрация по area', `Status: ${filtered.status}`)
}

// ─────────────────────────────────────────────────────────────
// TEST 4: API — OTP Login
// ─────────────────────────────────────────────────────────────
async function testOtpLogin() {
  console.log('\n🔐 [OTP LOGIN TESTS]')

  // Тест пустых данных — должен вернуть 400
  const r1 = await apiPost('/api/auth/otp-login', {})
  if (r1.status === 400) log('pass', 'Пустой запрос возвращает 400')
  else log('fail', 'Пустой запрос', `Ожидали 400, получили ${r1.status}`)

  // Тест неверного кода — должен вернуть 401
  const r2 = await apiPost('/api/auth/otp-login', { username: 'testuser_notexist', code: '0000' })
  if (r2.status === 401) log('pass', 'Неверный код возвращает 401')
  else log('warn', 'Неверный код', `Ожидали 401, получили ${r2.status}`)

  // Проверяем реального юзера из базы
  const realUsers = await sql`
    SELECT username, telegram_id, otp_code FROM public.profiles 
    WHERE otp_code IS NOT NULL LIMIT 1
  `
  if (realUsers.length > 0) {
    const u = realUsers[0]
    const r3 = await apiPost('/api/auth/otp-login', { 
      username: u.username, 
      code: u.otp_code 
    })
    if (r3.data?.success) log('pass', 'Вход с реальным кодом работает', `user: ${u.username}`)
    else log('fail', 'Вход с реальным кодом', r3.data?.error || 'Unknown error')
  } else {
    log('warn', 'Нет пользователей с активными OTP кодами', 'Пропуск теста')
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 5: API — Профиль
// ─────────────────────────────────────────────────────────────
async function testProfileApi() {
  console.log('\n👤 [PROFILE API TESTS]')

  // Проверка verify с неверным ID
  const r1 = await apiPost('/api/auth/verify', { id: '00000000-0000-0000-0000-000000000000' })
  if (r1.data?.exists === false) log('pass', 'Verify с несуществующим ID возвращает exists:false')
  else log('warn', 'Verify с несуществующим ID', JSON.stringify(r1.data))

  // Проверка с реальным пользователем
  const realUser = await sql`SELECT id, username FROM public.profiles LIMIT 1`
  if (realUser.length > 0) {
    const r2 = await apiPost('/api/auth/verify', { id: realUser[0].id })
    if (r2.data?.exists) log('pass', 'Verify с реальным ID работает', `user: ${realUser[0].username}`)
    else log('fail', 'Verify с реальным ID', JSON.stringify(r2.data))
  }

  // Проверка update без ID — должна быть ошибка
  const r3 = await apiPost('/api/profile/update', { full_name: 'Test' })
  if (!r3.data?.success || r3.status >= 400) log('pass', 'Update без ID корректно обрабатывается')
  else log('warn', 'Update без ID вернул success:true — потенциальная уязвимость!')
}

// ─────────────────────────────────────────────────────────────
// TEST 6: API — Заявки
// ─────────────────────────────────────────────────────────────
async function testApplicationsApi() {
  console.log('\n📋 [APPLICATIONS API TESTS]')

  // Отклик без данных — должен вернуть ошибку
  const r1 = await apiPost('/api/applications/create', {})
  if (!r1.data?.success) log('pass', 'Пустой отклик корректно отклоняется')
  else log('fail', 'Пустой отклик принят как успех!')

  // Отклик с несуществующим telegram_id
  const r2 = await apiPost('/api/applications/create', { 
    vacancy_id: '00000000-0000-0000-0000-000000000000',
    telegram_id: '1' 
  })
  if (!r2.data?.success) log('pass', 'Отклик с несуществующим пользователем отклонен')
  else log('fail', 'Отклик с несуществующим пользователем принят!')

  // Проверяем employer list
  const r3 = await apiGet('/api/applications/list-for-employer')
  if (r3.status === 400) log('pass', 'list-for-employer без employer_id возвращает 400')
  else log('warn', 'list-for-employer без employer_id', `Status: ${r3.status}`)

  // Проверяем real employer
  const employer = await sql`SELECT id FROM public.profiles WHERE role = 'employer' LIMIT 1`
  if (employer.length > 0) {
    const r4 = await apiGet(`/api/applications/list-for-employer?employer_id=${employer[0].id}`)
    if (r4.data?.success) log('pass', 'list-for-employer с реальным employer_id работает')
    else log('fail', 'list-for-employer с реальным employer_id', r4.data?.error)
  } else {
    log('warn', 'Нет работодателей в базе', 'Пропуск теста')
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 7: DATA INTEGRITY — Целостность данных
// ─────────────────────────────────────────────────────────────
async function testDataIntegrity() {
  console.log('\n🔗 [DATA INTEGRITY TESTS]')

  // Профили без telegram_id
  const orphans = await sql`SELECT COUNT(*) as cnt FROM public.profiles WHERE telegram_id IS NULL`
  const cnt = Number(orphans[0].cnt)
  if (cnt === 0) log('pass', 'Все профили имеют telegram_id')
  else log('warn', `${cnt} профилей без telegram_id`, 'Они не смогут войти через бота')

  // Вакансии без employer_id
  const noEmployer = await sql`SELECT COUNT(*) as cnt FROM public.vacancies WHERE employer_id IS NULL`
  if (Number(noEmployer[0].cnt) === 0) log('pass', 'Все вакансии имеют employer_id')
  else log('warn', `${noEmployer[0].cnt} вакансий без employer_id`)

  // Отклики с несуществующим youth_id
  const broken = await sql`
    SELECT COUNT(*) as cnt FROM public.applications a
    LEFT JOIN public.profiles p ON p.id = a.youth_id
    WHERE p.id IS NULL
  `
  if (Number(broken[0].cnt) === 0) log('pass', 'Все отклики ссылаются на реальных пользователей')
  else log('fail', `${broken[0].cnt} откликов указывают на несуществующих пользователей!`)

  // Пользователи с ролью
  const roles = await sql`SELECT role, COUNT(*) as cnt FROM public.profiles GROUP BY role`
  for (const r of roles) {
    log('pass', `Роль '${r.role || 'NULL'}'`, `${r.cnt} профилей`)
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 8: ENV VARS — Переменные окружения (только локально)
// ─────────────────────────────────────────────────────────────
async function testEnvVars() {
  console.log('\n🔑 [ENV VARS CHECK]')
  const vars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'TELEGRAM_BOT_TOKEN',
    'QWEN_API_KEY'
  ]
  // Читаем .env.local
  const fs = require('fs')
  try {
    const env = fs.readFileSync('.env.local', 'utf-8')
    for (const v of vars) {
      if (env.includes(v + '=')) log('pass', `${v} задан в .env.local`)
      else log('fail', `${v} ОТСУТСТВУЕТ в .env.local`)
    }
  } catch {
    log('warn', '.env.local не найден', 'Убедитесь что переменные заданы на Vercel')
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN — Запуск всех тестов
// ─────────────────────────────────────────────────────────────
async function runAll() {
  console.log('═'.repeat(55))
  console.log('  🧪 N84 SYSTEM TEST SUITE — ' + new Date().toLocaleString('ru'))
  console.log('═'.repeat(55))

  await testDatabase()
  await testSchema()
  await testVacanciesApi()
  await testOtpLogin()
  await testProfileApi()
  await testApplicationsApi()
  await testDataIntegrity()
  await testEnvVars()

  console.log('\n' + '═'.repeat(55))
  console.log(`  📊 ИТОГ: ✅ ${passed} PASSED  ❌ ${failed} FAILED  ⚠️  ${warnings} WARNINGS`)
  console.log('═'.repeat(55))

  if (failed > 0) {
    console.log('\n⚠️  КРИТИЧЕСКИЕ ОШИБКИ:')
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.detail}`)
    })
  }

  await sql.end()
  process.exit(failed > 0 ? 1 : 0)
}

runAll()
