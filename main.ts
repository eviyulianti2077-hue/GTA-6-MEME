import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

interface PostPayload {
  url: string;
}

function main(): void {
  const botDir: string = process.env.MAKEFUN_BOT_DIR
    ? path.resolve(process.env.MAKEFUN_BOT_DIR)
    : process.cwd();

  const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR
    ? path.resolve(process.env.MAKEFUN_OUTPUT_DIR)
    : '/output';

  const sourcePath: string = path.join(botDir, 'POST.json');
  const targetPath: string = path.join(outputDir, 'POST.json');

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required POST.json at ${sourcePath}`);
  }

  const rawContent: string = fs.readFileSync(sourcePath, 'utf8');
  const parsed: PostPayload = JSON.parse(rawContent) as PostPayload;

  if (!parsed || typeof parsed.url !== 'string' || !parsed.url.startsWith('https://')) {
    throw new Error('POST.json must contain a valid HTTPS "url" field.');
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(targetPath, rawContent, 'utf8');
}

main();
