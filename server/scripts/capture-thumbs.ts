import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const thumbsDir = path.join(process.cwd(), '..', 'public', 'thumbs');
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0);
const WAIT_MS = Number(process.argv.find((a) => a.startsWith('--wait='))?.split('=')[1] || 8000);
const RETRY_WAIT_MS = Number(
  process.argv.find((a) => a.startsWith('--retry-wait='))?.split('=')[1] || 20000
);
const MAX_LOADING_RETRIES = Number(
  process.argv.find((a) => a.startsWith('--loading-retries='))?.split('=')[1] || 2
);
const FORCE = process.argv.includes('--force');
const VALIDATE_EXISTING = process.argv.includes('--validate-existing');

// Assinatura RGB 32x18 da tela "carregando objeto digital" usada pelos ODAs.
// A baixa resolução torna a comparação tolerante ao tamanho original da captura.
const LOADING_REFERENCE = Buffer.from(
  '+vr6+fn5+Pj4+Pj49/f2+Pj4+Pj49/j4/v7+/////////////////////////////////////////////////////////////////////////////////////////////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7+///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v7+/v7+/v7+/v7+/v7+//7+////////////////////////////////////////////9vf5qLzH/////////////////////////////////////////////v///f/+//////////////////////////78/////////////////////////////////v7/////8fT2c5Wn/////////////////////////////////////v7+////2ObriZyi9fPz6uvr7u/v7O3t6+zu8u/r8uLG/fz4/////////////////////////////v//////9Pb4eZiq/////////////////////////////////////v7+////4e3vu8rL+vv8+fn5+vr6+vr6+fr6+/v4+/To//78////////////////////////////////////+vz8ydXc/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7+/f7+/////////////v7+/v7+/v7+//7+/////////////////////////////////////////////f3+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+//7+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+/////eHd/ufk//////////////////////////////////////////////////////////////////////////////////////////////////////////////////79////+rmt/MW7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////',
  'base64'
);
const LOADING_VISUAL_THRESHOLD = 0.01;

function thumbFile(codigo: string): string {
  return path.join(thumbsDir, `${codigo.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`);
}

function alreadyExists(codigo: string): boolean {
  return fs.existsSync(thumbFile(codigo));
}

function extractVimeoId(url: string): string | null {
  const fromQuery = url.match(/[?&]id=(\d{6,})/i);
  if (fromQuery) return fromQuery[1];
  const fromPath = url.match(/vimeo\.com\/(?:video\/)?(\d{6,})/i);
  return fromPath?.[1] || null;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { headers: { 'User-Agent': 'AcervoDigital-Thumb/1.0' } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { 'User-Agent': 'AcervoDigital-Thumb/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function toWebp(src: string, dest: string, overwrite = FORCE): Promise<void> {
  const tmp = `${dest}.tmp.webp`;
  const sharp = (await import('sharp')).default;
  await sharp(src).resize(1280, 720, { fit: 'cover' }).webp({ quality: 78 }).toFile(tmp);
  if (fs.existsSync(dest) && !overwrite) {
    fs.unlinkSync(tmp);
    return;
  }
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  fs.renameSync(tmp, dest);
}

async function resemblesLoadingScreen(imagePath: string): Promise<boolean> {
  const sharp = (await import('sharp')).default;
  const sample = await sharp(imagePath)
    .resize(32, 18, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
  if (sample.length !== LOADING_REFERENCE.length) return false;
  let difference = 0;
  for (let i = 0; i < sample.length; i += 1) {
    difference += Math.abs(sample[i] - LOADING_REFERENCE[i]);
  }
  const normalizedDifference = difference / (sample.length * 255);
  return normalizedDifference <= LOADING_VISUAL_THRESHOLD;
}

async function captureVimeo(
  vimeoId: string,
  dest: string,
  overwrite = FORCE
): Promise<void> {
  const data = await fetchJson(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
  const thumb = data.thumbnail_url_with_play_button || data.thumbnail_url;
  if (!thumb) throw new Error('Vimeo sem thumbnail');
  const tmp = dest.replace(/\.webp$/i, '.jpg');
  await download(thumb.replace(/_\d+\.jpg/i, '_1280.jpg'), tmp).catch(async () => {
    await download(thumb, tmp);
  });
  await toWebp(tmp, dest, overwrite);
  fs.unlinkSync(tmp);
}

async function pageShowsLoadingText(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const doc = (globalThis as any).document;
    const text = (doc?.body?.innerText || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return text.includes('carregando objeto digital');
  });
}

async function capturePage(
  url: string,
  dest: string,
  browser: any,
  overwrite = FORCE
): Promise<void> {
  const page = await browser.newPage();
  const png = `${dest}.capture.png`;
  try {
    await page.setViewportSize({ width: 1280, height: 720 });
    const normalizedUrl = normalizeUrl(url);
    let navigationError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await page.goto(normalizedUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
        navigationError = undefined;
        break;
      } catch (error) {
        navigationError = error;
        if (attempt < 2) {
          console.log('🔄 Falha ao abrir URL; nova tentativa em 5000ms');
          await page.waitForTimeout(5000);
        }
      }
    }
    if (navigationError) throw navigationError;
    try {
      await page.waitForLoadState('networkidle', { timeout: WAIT_MS });
    } catch {
      /* alguns ODAs ficam com rede ativa; segue o wait extra */
    }
    await page.waitForTimeout(WAIT_MS);
    try {
      await page.waitForFunction(
        () => {
          const doc = (globalThis as any).document;
          const win = globalThis as any;
          const loaders = doc.querySelectorAll(
            '.loading, .loader, .spinner, [class*="loading"], [class*="spinner"], [id*="loading"]'
          );
          return [...loaders].every((el) => {
            const style = win.getComputedStyle(el);
            return style.display === 'none' || style.visibility === 'hidden' || (el as any).offsetParent === null;
          });
        },
        { timeout: 5000 }
      );
    } catch {
      /* se o loader não sumir, fotografa mesmo assim */
    }
    for (let attempt = 0; attempt <= MAX_LOADING_RETRIES; attempt += 1) {
      await page.screenshot({ path: png, type: 'png' });
      const loadingByText = await pageShowsLoadingText(page).catch(() => false);
      const loadingByImage = await resemblesLoadingScreen(png).catch(() => false);
      if (!loadingByText && !loadingByImage) {
        await toWebp(png, dest, overwrite);
        fs.unlinkSync(png);
        return;
      }

      if (attempt === MAX_LOADING_RETRIES) {
        throw new Error(
          `tela de carregamento persistiu após ${MAX_LOADING_RETRIES + 1} capturas`
        );
      }

      const extraWait = RETRY_WAIT_MS * (attempt + 1);
      console.log(
        `🔄 Loader detectado; aguardando mais ${extraWait}ms (tentativa ${attempt + 2}/${MAX_LOADING_RETRIES + 1})`
      );
      await page.waitForTimeout(extraWait);
    }
  } finally {
    if (fs.existsSync(png)) fs.unlinkSync(png);
    await page.close();
  }
}

async function main() {
  fs.mkdirSync(thumbsDir, { recursive: true });
  const odas = await prisma.oDA.findMany({
    select: { codigoOda: true, titulo: true, linkRepositorio: true },
    orderBy: { id: 'asc' },
  });

  const jobs: Array<(typeof odas)[number] & { replaceExisting: boolean }> = [];
  let invalidExisting = 0;
  for (const oda of odas) {
    if (!oda.codigoOda || !oda.linkRepositorio) continue;
    const exists = alreadyExists(oda.codigoOda);
    if (exists && !FORCE) {
      if (!VALIDATE_EXISTING) continue;
      const invalid = await resemblesLoadingScreen(thumbFile(oda.codigoOda)).catch(() => false);
      if (!invalid) continue;
      invalidExisting += 1;
    }
    jobs.push({ ...oda, replaceExisting: exists });
  }
  const queue = LIMIT > 0 ? jobs.slice(0, LIMIT) : jobs;
  console.log(`🖼️  Thumbs a capturar: ${queue.length} (faltando ${jobs.length})`);
  console.log(
    `⏭️  Arquivos existentes não serão sobrescritos${FORCE ? ' (FORCE ligado)' : ''}`
  );
  if (VALIDATE_EXISTING) {
    console.log(`🔎 Thumbs existentes com loader detectado: ${invalidExisting}`);
  }
  console.log(`⏱️  Espera após load: ${WAIT_MS}ms`);
  console.log(
    `🔁 Loader: até ${MAX_LOADING_RETRIES} novas tentativas, espera extra de ${RETRY_WAIT_MS}ms`
  );

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  let ok = 0;
  let skip = 0;
  let fail = 0;

  const CONCURRENCY = 2;
  let index = 0;

  async function worker() {
    while (index < queue.length) {
      const current = index;
      index += 1;
      const oda = queue[current];
      const codigo = oda.codigoOda!;
      if (!FORCE && alreadyExists(codigo) && !oda.replaceExisting) {
        skip += 1;
        console.log(`⏭️  ${codigo} já existe`);
        continue;
      }
      const dest = thumbFile(codigo);
      const url = oda.linkRepositorio!;
      const overwrite = FORCE || oda.replaceExisting;
      try {
        const vimeoId = extractVimeoId(url);
        if (vimeoId) {
          try {
            await captureVimeo(vimeoId, dest, overwrite);
          } catch {
            await capturePage(url, dest, browser, overwrite);
          }
        } else {
          await capturePage(url, dest, browser, overwrite);
        }
        ok += 1;
        console.log(`✅ ${ok}/${queue.length} ${codigo}`);
      } catch (err: any) {
        fail += 1;
        console.error(`❌ ${codigo}: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  await browser.close();
  console.log(`\n🎉 Captura concluída: ${ok} ok, ${skip} pulados, ${fail} falhas`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
