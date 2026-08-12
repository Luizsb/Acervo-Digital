const BNCC_CODE_RE = /\b((?:EI|EF|EM)\d{2}[A-Z]{2,4}\d{2,3}[A-Z0-9]*)\b/i;

export function extractBnccCode(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  const beforePipe = trimmed.split('|')[0].trim();
  const match = beforePipe.match(BNCC_CODE_RE) || trimmed.match(BNCC_CODE_RE);
  if (match?.[1]) return match[1].toUpperCase();
  if (beforePipe && !/\s/.test(beforePipe) && beforePipe.length <= 16) {
    return beforePipe.toUpperCase();
  }
  return '';
}

export function extractBnccDescription(value?: string | null, fallback?: string | null): string {
  if (fallback && fallback.trim()) return fallback.trim();
  if (!value) return '';
  const pipe = value.indexOf('|');
  if (pipe >= 0) return value.slice(pipe + 1).trim();
  const code = extractBnccCode(value);
  if (!code) return value.trim();
  return value
    .replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')
    .replace(/^[|\-–:\s]+/, '')
    .trim();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDuration(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;
  if (/[a-zà-ú]/i.test(trimmed) && /min|hora|seg|\bh\b/i.test(trimmed)) return trimmed;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;

  const n = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return undefined;

  let totalSeconds: number | null = null;
  if (n > 0 && n < 1) {
    totalSeconds = Math.round(n * 24 * 60 * 60);
  } else if (trimmed.includes('.') && n < 24) {
    totalSeconds = Math.round(n * 24 * 60 * 60);
  }

  if (totalSeconds === null || totalSeconds <= 0) {
    if (trimmed.length > 10 && trimmed.includes('.')) return undefined;
    return trimmed;
  }

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${pad(m)}min`;
  if (m > 0 && s > 0) return `${m} min`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
}
