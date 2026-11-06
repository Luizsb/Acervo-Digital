import fs from 'fs';
import path from 'path';
import type { DemoCatalog } from './demoCatalog';

const DEMO_CATALOG_NAME = 'catalogo-demo.json';

/** `server/seed/`, a partir do código-fonte (`server/lib`) ou do build (`server/dist/lib`). */
export function demoCatalogFile(): string {
  const candidates = [path.join(__dirname, '..', 'seed'), path.join(__dirname, '..', '..', 'seed')];
  const dir = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
  return path.join(dir, DEMO_CATALOG_NAME);
}

export function readDemoCatalog<Oda, Bncc>(file: string = demoCatalogFile()): DemoCatalog<Oda, Bncc> | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as DemoCatalog<Oda, Bncc>;
}
