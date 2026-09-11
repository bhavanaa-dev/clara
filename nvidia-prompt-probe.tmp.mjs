const prompts = await import('./src/lib/gemini/prompts.ts');
const narrative = 'My ceiling has been leaking for three weeks. I informed my landlord twice through WhatsApp. He said he would send someone, but nobody came. The leak is still happening.';
const user = prompts.buildExtractionPrompt(narrative);
console.log('prompt chars:', user.length);

const variant = process.argv[2] || 'baseline';
const body = {
  model: 'deepseek-ai/deepseek-v4-flash-0731',
  messages: [{ role: 'user', content: user }],
  temperature: 0.1,
  response_format: { type: 'json_object' },
};
if (variant === 'capped') body.max_tokens = 4096;
if (variant === 'nocap-nofmt') delete body.response_format;

const t0 = Date.now();
try {
  const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.NVIDIA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  console.log('variant=' + variant, 'HTTP ' + r.status, 'after ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  const t = await r.text();
  console.log('body len:', t.length, 'head:', t.slice(0, 300));
} catch (e) {
  console.log('variant=' + variant, 'FETCH_ERROR after ' + ((Date.now() - t0) / 1000).toFixed(1) + 's: ' + e.message);
}
