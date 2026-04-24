/**
 * N84 Platform — Health Check Suite
 * Запуск: node tests/health_check.js
 * 
 * Честная проверка реальной работоспособности всех компонентов.
 * Никакого "проверки по внешнему виду" — только реальные запросы.
 */

const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const BASE_URL = 'https://n84-platform.vercel.app';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`  ✅ PASS: ${label}`);
  passed++;
}

function fail(label, detail) {
  console.log(`  ❌ FAIL: ${label}`);
  if (detail) console.log(`     → ${detail}`);
  failed++;
}

// ─────────────────────────────────────────
// 1. База данных: доступность и схема
// ─────────────────────────────────────────
async function testDatabase() {
  console.log('\n【1】 БАЗА ДАННЫХ\n');

  // 1.1 Соединение
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw new Error(error.message);
    pass('Supabase соединение активно');
  } catch(e) { fail('Supabase соединение', e.message); }

  // 1.2 Таблица profiles
  try {
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    pass(`Таблица profiles доступна (${count} записей)`);
  } catch(e) { fail('Таблица profiles', e.message); }

  // 1.3 Таблица vacancies
  try {
    const { count, error } = await supabase.from('vacancies').select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    pass(`Таблица vacancies доступна (${count} записей)`);
  } catch(e) { fail('Таблица vacancies', e.message); }

  // 1.4 Таблица applications
  try {
    const { count, error } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    pass(`Таблица applications доступна (${count} записей)`);
  } catch(e) { fail('Таблица applications', e.message); }

  // 1.5 Проверка что хоть один work-пользователь с telegram_id есть
  try {
    const { data, error } = await supabase.from('profiles').select('id, role, telegram_id').not('telegram_id', 'is', null);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Нет ни одного профиля с telegram_id — рассылка невозможна!');
    pass(`Кандидаты с telegram_id: ${data.length} чел.`);
  } catch(e) { fail('Кандидаты с telegram_id', e.message); }
}

// ─────────────────────────────────────────
// 2. API Сервер на Vercel
// ─────────────────────────────────────────
async function testApiEndpoints() {
  console.log('\n【2】 API ЭНДПОИНТЫ (Vercel)\n');

  // 2.1 Страница успешно отвечает
  try {
    const r = await fetch(`${BASE_URL}`, { method: 'HEAD' });
    if (r.status !== 200) throw new Error(`Статус: ${r.status}`);
    pass('Главная страница доступна (200)');
  } catch(e) { fail('Главная страница', e.message); }

  // 2.2 /api/vacancies/list-all
  try {
    const r = await fetch(`${BASE_URL}/api/vacancies/list-all`);
    const json = await r.json();
    if (!json.success) throw new Error(json.error || 'Нет поля success:true');
    pass(`/api/vacancies/list-all работает (${json.vacancies?.length ?? 0} вакансий)`);
  } catch(e) { fail('/api/vacancies/list-all', e.message); }

  // 2.3 /api/vacancies/delete существует
  try {
    // POST с пустым телом должен вернуть 400, а НЕ 404
    const r = await fetch(`${BASE_URL}/api/vacancies/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '' }),
    });
    if (r.status === 404) throw new Error('Роут не найден на Vercel! 404');
    pass(`/api/vacancies/delete существует (статус: ${r.status})`);
  } catch(e) { fail('/api/vacancies/delete', e.message); }

  // 2.4 /api/vacancies/create (пустой запрос — ожидаем 4xx или 5xx, но не 404)
  try {
    const r = await fetch(`${BASE_URL}/api/vacancies/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (r.status === 404) throw new Error('Роут не найден на Vercel! 404');
    pass(`/api/vacancies/create существует (статус: ${r.status})`);
  } catch(e) { fail('/api/vacancies/create', e.message); }

  // 2.5 /api/bot существует (должен быть 405 GET, но не 404)
  try {
    const r = await fetch(`${BASE_URL}/api/bot`);
    if (r.status === 404) throw new Error('Роут /api/bot не найден! 404');
    pass(`/api/bot существует (статус: ${r.status})`);  
  } catch(e) { fail('/api/bot', e.message); }
}

// ─────────────────────────────────────────
// 3. Авторизация: реальный вход
// ─────────────────────────────────────────
async function testAuth() {
  console.log('\n【3】 АВТОРИЗАЦИЯ\n');

  // Неверный логин — должен вернуть 401
  try {
    const r = await fetch(`${BASE_URL}/api/auth/otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nonexistent_user_xyz', code: '0000' }),
    });
    const json = await r.json();
    if (r.status === 401 && !json.success) {
      pass('Неверные данные корректно отклоняются (401)');
    } else {
      fail('Авторизация', `Ожидали 401, получили ${r.status}`);
    }
  } catch(e) { fail('Авторизация', e.message); }
}

// ─────────────────────────────────────────
// 4. ИИ (Qwen)
// ─────────────────────────────────────────
async function testAI() {
  console.log('\n【4】 ИИ (Qwen AI)\n');

  if (!process.env.QWEN_API_KEY || !process.env.QWEN_BASE_URL) {
    fail('ENV QWEN_API_KEY / QWEN_BASE_URL', 'Переменные среды не найдены!');
    return;
  }

  try {
    const r = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL,
        messages: [{ role: 'user', content: 'Reply with one word: Ready' }],
        enable_thinking: false,
        max_tokens: 10,
      }),
    });
    const json = await r.json();
    if (json.error) throw new Error(json.error.message);
    const reply = json.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Пустой ответ от ИИ');
    pass(`ИИ отвечает: "${reply.trim()}"`);
  } catch(e) { fail(`Qwen (${process.env.QWEN_MODEL})`, e.message); }
}

// ─────────────────────────────────────────
// 5. Telegram Bot
// ─────────────────────────────────────────
async function testTelegram() {
  console.log('\n【5】 TELEGRAM BOT\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) { fail('TELEGRAM_BOT_TOKEN', 'Не найден в .env.local!'); return; }

  // 5.1 getMe
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.description);
    pass(`Бот активен: @${json.result.username} (ID: ${json.result.id})`);
  } catch(e) { fail('Telegram getMe', e.message); }

  // 5.2 Webhook настроен и указывает на Vercel
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const json = await r.json();
    const url = json.result?.url || '';
    if (!url.includes('vercel.app')) throw new Error(`Webhook не настроен или неверный: "${url}"`);
    if (json.result.last_error_message) {
      fail(`Webhook URL верный, но есть ошибка`, json.result.last_error_message);
    } else {
      pass(`Webhook настроен → ${url}`);
    }
    const pending = json.result.pending_update_count;
    if (pending > 10) fail(`Webhook накопил ${pending} необработанных сообщений`);
    else pass(`Очередь webhook чистая (${pending} pending)`);
  } catch(e) { fail('Webhook info', e.message); }
}

// ─────────────────────────────────────────
// ИТОГИ
// ─────────────────────────────────────────
async function runAll() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║  N84 — КОМПЛЕКСНЫЙ HEALTH CHECK      ║');
  console.log('╚══════════════════════════════════════╝');

  await testDatabase();
  await testApiEndpoints();
  await testAuth();
  await testAI();
  await testTelegram();

  const total = passed + failed;
  console.log('\n══════════════════════════════════════');
  console.log(`  ИТОГО: ${passed}/${total} тестов прошли`);
  if (failed === 0) {
    console.log('  🏆 ВСЕ ТЕСТЫ ЗЕЛЁНЫЕ — ПРОЕКТ ГОТОВ!');
  } else {
    console.log(`  ⚠️  Найдено проблем: ${failed}. Исправьте их перед демо!`);
  }
  console.log('══════════════════════════════════════\n');
}

runAll();
