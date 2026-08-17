import path from 'path';
import { spawnSync } from 'child_process';

const browsersPath =
  process.env.ACERVO_PLAYWRIGHT_BROWSERS_PATH ||
  path.join(process.cwd(), 'node_modules', '.playwright-browsers');
const cliPath = path.join(path.dirname(require.resolve('playwright/package.json')), 'cli.js');

console.log(`Instalando Chromium em ${browsersPath}`);
const result = spawnSync(process.execPath, [cliPath, 'install', 'chromium'], {
  cwd: process.cwd(),
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath },
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
