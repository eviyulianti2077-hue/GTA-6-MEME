import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function validatePost(raw) {
  let post;
  try {
    post = JSON.parse(raw);
  } catch {
    throw new Error('POST.json is not valid JSON');
  }
  if (post === null || typeof post !== 'object' || Array.isArray(post)) throw new Error('POST.json must be an object with a url field');
  const value = post.url;
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value || value.split('').some((character) => character.trim() === '')) throw new Error('POST.json url must be non-empty and contain no whitespace');
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('POST.json url must be a valid absolute URL');
  }
  if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.hostname === '' || parsed.username !== '' || parsed.password !== '') throw new Error('POST.json url must use HTTP or HTTPS and must not contain credentials');
  return value;
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, 'POST.json');
  const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  let raw;
  try {
    raw = await readFile(source, 'utf8');
  } catch (error) {
    throw new Error('Could not read POST.json: ' + (error instanceof Error ? error.message : String(error)));
  }
  validatePost(raw);
  try {
    await mkdir(outputDirectory, { recursive: true });
    await copyFile(source, join(outputDirectory, 'POST.json'));
  } catch (error) {
    throw new Error('Could not copy POST.json to ' + outputDirectory + ': ' + (error instanceof Error ? error.message : String(error)));
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
