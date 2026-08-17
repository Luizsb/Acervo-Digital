/**
 * Copia um texto para a área de transferência.
 *
 * `navigator.clipboard` só existe em contexto seguro (HTTPS ou localhost) e o
 * acervo é servido por HTTP simples, então o comando legado de cópia é o único
 * caminho disponível em produção.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permissão negada ou contexto inseguro: tenta o caminho legado.
    }
  }

  return copyUsingTemporaryField(text);
}

function copyUsingTemporaryField(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  // Fora da área visível para a seleção não deslocar a página nem piscar.
  field.style.position = 'fixed';
  field.style.top = '-1000px';
  field.style.opacity = '0';
  document.body.appendChild(field);

  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  try {
    field.select();
    field.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    if (selection && previousRange) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
}
