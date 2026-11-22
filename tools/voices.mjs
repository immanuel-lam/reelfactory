// Find an ElevenLabs narrator for the niche.
//   node tools/voices.mjs search "<words>" [language code, e.g. en]   the shared voice library
//   node tools/voices.mjs mine                                         voices in your own account
// Prints id, name, accent, gender, age, use case and a preview URL you can open
// to listen. The key comes from tools/secrets.mjs and is never printed.
import { elevenKey } from './secrets.mjs';

const [, , mode, words = '', lang = ''] = process.argv;
const get = async (url) => {
  const res = await fetch(url, { headers: { 'xi-api-key': elevenKey() } });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
};
const show = (v) =>
  console.log(
    [v.voice_id, v.name, v.accent ?? v.labels?.accent, v.gender ?? v.labels?.gender, v.age ?? v.labels?.age, v.use_case ?? v.labels?.use_case, v.preview_url]
      .filter(Boolean)
      .join(' | '),
  );
if (mode === 'search') {
  const q = new URLSearchParams({ search: words, page_size: '15' });
  if (lang) q.set('language', lang);
  (await get(`https://api.elevenlabs.io/v1/shared-voices?${q}`)).voices.forEach(show);
} else if (mode === 'mine') {
  (await get('https://api.elevenlabs.io/v2/voices?page_size=50')).voices.forEach(show);
} else {
  console.error('usage: node tools/voices.mjs search "<words>" [language] | mine');
  process.exit(1);
}
