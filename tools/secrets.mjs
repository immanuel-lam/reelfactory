// The ElevenLabs API key, from (in order):
//   1. ELEVENLABS_API_KEY in the environment (or in .env at the repo root),
//   2. a file named by ELEVEN_KEY_FILE,
//   3. the macOS Keychain: service "reelfactory-elevenlabs" (store it with
//      scripts/set-key.sh).
// The key is never printed and never written into the repo.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const fromDotEnv = () => {
  const f = path.join(root, '.env');
  if (!fs.existsSync(f)) return '';
  const m = /^ELEVENLABS_API_KEY\s*=\s*"?([^"\n]+)"?/m.exec(fs.readFileSync(f, 'utf8'));
  return m ? m[1].trim() : '';
};

let cached = '';
export const elevenKey = () => {
  if (cached) return cached;
  cached = (process.env.ELEVENLABS_API_KEY ?? '').trim() || fromDotEnv();
  if (!cached && process.env.ELEVEN_KEY_FILE) cached = fs.readFileSync(process.env.ELEVEN_KEY_FILE, 'utf8').trim();
  if (!cached && process.platform === 'darwin') {
    try {
      cached = execFileSync('security', ['find-generic-password', '-s', 'reelfactory-elevenlabs', '-w'], { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      /* not in the Keychain */
    }
  }
  if (!cached) throw new Error('No ElevenLabs key. Run scripts/set-key.sh, or set ELEVENLABS_API_KEY in .env.');
  return cached;
};
