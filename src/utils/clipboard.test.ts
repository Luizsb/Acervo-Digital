import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyTextToClipboard } from './clipboard';

function setClipboardApi(writeText: ((text: string) => Promise<void>) | null) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  setClipboardApi(null);
  vi.restoreAllMocks();
});

describe('copyTextToClipboard', () => {
  it('usa a API assíncrona quando ela está disponível', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboardApi(writeText);

    await expect(copyTextToClipboard('SAE25_EI_G4')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('SAE25_EI_G4');
  });

  it('recorre ao comando legado quando a API não existe (acervo em HTTP)', async () => {
    setClipboardApi(null);
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    await expect(copyTextToClipboard('SAE25_EI_G4')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('recorre ao comando legado quando a API falha', async () => {
    setClipboardApi(vi.fn().mockRejectedValue(new Error('permissão negada')));
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    await expect(copyTextToClipboard('SAE25_EI_G4')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('sinaliza falha quando nenhum caminho copia', async () => {
    setClipboardApi(null);
    document.execCommand = vi.fn().mockReturnValue(false);

    await expect(copyTextToClipboard('SAE25_EI_G4')).resolves.toBe(false);
  });

  it('não tenta copiar texto vazio', async () => {
    const writeText = vi.fn();
    setClipboardApi(writeText);

    await expect(copyTextToClipboard('')).resolves.toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('não deixa o campo temporário na página', async () => {
    setClipboardApi(null);
    document.execCommand = vi.fn().mockReturnValue(true);

    await copyTextToClipboard('SAE25_EI_G4');
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });
});
