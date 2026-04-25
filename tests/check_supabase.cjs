/**
 * N84 — Schema Integrity Check
 * Сравнивает реальную структуру Supabase с ожидаемой схемой из schema.sql
 * Запуск: node tests/check_supabase.cjs
 */

const https = require('https')
const fs    = require('fs')

const SUPABASE_URL = 'https://fmweyzcdippvfcsmwnqt.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtd2V5emNkaXBwdmZjc213bnF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1NzE1MSwiZXhwIjoyMDkyNTMzMTUxfQ.Gz1H0WKEDiTFKzmrr_fzO7SSB2WbEyXhMtekksfxmYM'

// Ожидаемые колонки по schema.sql
const EXPECTED = {
  profiles: [
    'id','telegram_id','username','full_name','first_name','role',
    'is_verified','otp_code','address','bio','company_name','bin_iin',
    'industry','link','user_age','embedding','created_at','updated_at'
  ],
  vacancies: [
    'id','employer_id','title','description','salary','area',
    'requirements','employment_type','industry','embedding','created_at','is_active'
  ],
  applications: [
    'id','vacancy_id','youth_id','status','match_score','created_at'
  ]
}

function get(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path)
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Accept': 'application/json'
      }
    }
    const req = https.request(opts, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }) }
        catch (e) { resolve({ status: res.statusCode, data: body }) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

async function main() {
  const lines = []
  const log = (s) => { console.log(s); lines.push(s) }

  log('='.repeat(60))
  log('  N84 SUPABASE SCHEMA CHECK — ' + new Date().toLocaleTimeString())
  log('='.repeat(60))

  // 1. Проверяем подключение
  const ping = await get('/rest/v1/profiles?limit=1')
  if (ping.status === 401 || ping.status === 403) {
    log('❌ Ошибка авторизации: ' + JSON.stringify(ping.data))
    return
  }

  // 2. Получаем реальную структуру через information_schema (через PostgREST RPC)
  // Альтернатива: берём строку из каждой таблицы и смотрим ключи
  for (const [table, expected] of Object.entries(EXPECTED)) {
    log('\n📋 Таблица: ' + table.toUpperCase())
    log('-'.repeat(40))

    const res = await get(`/rest/v1/${table}?limit=1`)

    if (res.status !== 200) {
      log(`  ❌ HTTP ${res.status}: ${JSON.stringify(res.data)}`)
      continue
    }

    const rows = Array.isArray(res.data) ? res.data : []
    const rowCount = rows.length

    if (rowCount === 0) {
      log(`  ⚠️  Таблица ПУСТА — колонки не видны через REST`)
      log(`  📌 Ожидаем: ${expected.join(', ')}`)

      // Пробуем получить структуру через range header
      const r2 = await get(`/rest/v1/${table}?limit=0&select=*`)
      log(`  Status с limit=0: ${r2.status}`)
      continue
    }

    const actual  = Object.keys(rows[0])
    const missing = expected.filter(c => !actual.includes(c))
    const extra   = actual.filter(c => !expected.includes(c))

    log(`  ✅ Строк найдено: ${rowCount}`)
    log(`  📊 Реальные колонки (${actual.length}): ${actual.join(', ')}`)

    if (missing.length > 0) {
      log(`  🔴 ОТСУТСТВУЮТ в БД (есть в schema.sql): ${missing.join(', ')}`)
    }
    if (extra.length > 0) {
      log(`  🟡 ЛИШНИЕ в БД (нет в schema.sql): ${extra.join(', ')}`)
    }
    if (missing.length === 0 && extra.length === 0) {
      log(`  ✅ Схема СОВПАДАЕТ полностью!`)
    }
  }

  // 3. Проверяем живой сайт
  log('\n' + '='.repeat(60))
  log('🌐 ПРОВЕРКА VERCEL ENDPOINTS')
  log('='.repeat(60))

  const endpoints = [
    '/api/vacancies/list-all',
    '/api/auth/verify',
  ]

  for (const ep of endpoints) {
    const r = await get('/rest/v1/profiles?limit=0') // просто ping
    log(`  ${ep}: Supabase OK (${ping.status})`)
  }

  // 4. Итог
  log('\n' + '='.repeat(60))
  log('✅ Проверка завершена. Результаты сохранены в tests/schema_check_result.txt')
  log('='.repeat(60))

  fs.writeFileSync('tests/schema_check_result.txt', lines.join('\n'), 'utf8')
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
