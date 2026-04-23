const https = require('https');
const url = 'https://api.telegram.org/bot8647696284:AAGIjFctRvDYgADCtDhynLzfBt6Ys-2e_DE/getWebhookInfo';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('TELEGRAM RESPONSE:', data);
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
