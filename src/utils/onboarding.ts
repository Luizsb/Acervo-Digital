import introJs, { Step } from 'intro.js';

const ONBOARDING_STORAGE_KEY = 'acervo-onboarding-v1';

function hasWindow() {
  return typeof window !== 'undefined';
}

function shouldRunOnboarding(): boolean {
  if (!hasWindow()) return false;
  try {
    const value = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value !== 'done';
  } catch {
    return true;
  }
}

function markOnboardingDone() {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'done');
  } catch {
    // ignore quota errors
  }
}

export function resetOnboardingProgress() {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore errors
  }
}

export function startOnboardingIfNeeded() {
  if (!hasWindow()) return;
  if (!shouldRunOnboarding()) return;

  // Garante que os elementos já foram renderizados
  window.setTimeout(() => {
    const hero = document.getElementById('acervo-hero');
    const contentType = document.getElementById('acervo-content-type');
    const search = document.getElementById('acervo-search');
    const filters = document.getElementById('acervo-filters');
    const grid = document.getElementById('acervo-project-grid');

    if (!hero || !contentType || !search || !filters || !grid) {
      // Elementos ainda não disponíveis; não roda o tour
      return;
    }

    const steps: Step[] = [
      {
        element: '#acervo-hero',
        title: 'Bem-vindo ao Acervo Digital',
        intro:
          'Aqui você encontra uma visão geral do acervo e dicas rápidas. Esta mensagem aparece apenas para apresentar a plataforma.',
      },
      {
        element: '#acervo-search',
        title: 'Busque seus recursos',
        intro:
          'Use a busca para encontrar rapidamente Objetos Digitais de Aprendizagem e videoaulas por palavra-chave, tema ou título.',
      },
      {
        element: '#acervo-content-type',
        title: 'Tipos de conteúdo',
        intro:
          'Alterne entre visualizar todo o acervo, apenas conteúdos audiovisuais ou apenas objetos digitais.',
      },
      {
        element: '#acervo-filters',
        title: 'Filtros inteligentes',
        intro:
          'Refine sua busca por ano/série, componente curricular, códigos BNCC, marcas, categorias de vídeo e muito mais.',
      },
      {
        element: '#acervo-project-grid',
        title: 'Cards do acervo',
        intro:
          'Clique em um card para ver detalhes do recurso, assistir ao vídeo quando disponível e acessar informações pedagógicas. Se quiser rever este tour no futuro, use a opção \"Rever tour do acervo\" no menu de perfil, no canto superior direito.',
      },
    ];

    const intro = introJs();
    intro.setOptions({
      steps,
      showProgress: true,
      showButtons: true,
      showBullets: true,
      overlayOpacity: 0.6,
      nextLabel: 'Próximo',
      prevLabel: 'Voltar',
      skipLabel: 'Pular Intro',
      doneLabel: 'Começar a explorar',
      tooltipClass: 'acervo-onboarding-tooltip',
    });

    intro.oncomplete(() => {
      markOnboardingDone();
    });
    intro.onexit(() => {
      markOnboardingDone();
    });

    intro.start();
  }, 600);
}

