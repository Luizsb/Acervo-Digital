import introJs from 'intro.js';

const ONBOARDING_STORAGE_KEY = 'acervo-onboarding-v1';

/** Só existe na galeria; sem ele na tela, o tour não começa. */
const GALLERY_MARKER = '#acervo-content-type';

type OnboardingStep = {
  element?: HTMLElement;
  title: string;
  intro: string;
};

type IntroInstance = ReturnType<typeof introJs>;

/**
 * O tour é único por sessão: a galeria pode disparar o start mais de uma vez
 * (carregamento do catálogo, troca de página), e duas instâncias do intro.js
 * criariam tooltips e overlays sobrepostos.
 */
let activeTour: IntroInstance | null = null;
let pendingStart: number | null = null;

/** Remove overlays/classes que o intro.js pode deixar para trás e travariam a tela. */
function removeTourArtifacts() {
  document
    .querySelectorAll(
      '.introjs-overlay, .introjs-helperLayer, .introjs-tooltipReferenceLayer, .introjs-disableInteraction'
    )
    .forEach((node) => node.remove());

  document
    .querySelectorAll(
      '.introjs-showElement, .introjs-relativePosition, .introjs-fixParent, .introjs-hidden'
    )
    .forEach((node) => {
      node.classList.remove(
        'introjs-showElement',
        'introjs-relativePosition',
        'introjs-fixParent',
        'introjs-hidden'
      );
    });

  document.body.classList.remove('introjs-notransition');
  document.documentElement.classList.remove('introjs-notransition');
}

function finishTour() {
  activeTour = null;
  markOnboardingDone();
  removeTourArtifacts();
}

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
  stopOnboarding();
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore errors
  }
}

/** Encerra o tour em andamento (ou agendado) e limpa a tela. */
export function stopOnboarding() {
  if (!hasWindow()) return;
  if (pendingStart !== null) {
    window.clearTimeout(pendingStart);
    pendingStart = null;
  }
  if (activeTour) {
    const tour = activeTour;
    activeTour = null;
    try {
      tour.exit(true);
    } catch {
      // a instância pode já ter sido encerrada pelo próprio intro.js
    }
  }
  removeTourArtifacts();
}

/** Primeiro seletor da lista que encontra um elemento visível. */
function getVisibleElement(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const element = getVisible(selector);
    if (element) return element;
  }
  return null;
}

/** Primeiro elemento visível do seletor: há cópias para celular e desktop, uma delas oculta. */
function getVisible(selector: string): HTMLElement | null {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    const styles = window.getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    if (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      bounds.width > 0 &&
      bounds.height > 0
    ) {
      return element;
    }
  }
  return null;
}

export function startOnboardingIfNeeded() {
  if (!hasWindow()) return;
  if (!shouldRunOnboarding()) return;
  if (activeTour || pendingStart !== null) return;

  // Garante que os elementos já foram renderizados
  pendingStart = window.setTimeout(() => {
    pendingStart = null;
    // O tour é da galeria: se o usuário saiu dela (login, ficha, admin), não começa
    // e continua pendente para a próxima visita.
    if (!getVisible(GALLERY_MARKER)) return;
    const steps: OnboardingStep[] = [
      {
        title: 'Encontre o recurso certo',
        intro:
          'Use a busca, os tipos de conteúdo e os filtros para localizar materiais adequados à sua necessidade pedagógica.',
      },
      ...[
        {
          selectors: ['#acervo-search'],
          title: 'Comece pela busca',
          intro: 'Pesquise por título, tema, palavra-chave ou outro termo relacionado ao conteúdo.',
        },
        {
          selectors: ['#acervo-content-type'],
          title: 'Escolha o tipo de conteúdo',
          intro: 'Consulte todo o acervo ou restrinja os resultados a conteúdos audiovisuais ou objetos digitais.',
        },
        {
          selectors: ['#acervo-filters'],
          title: 'Refine os resultados',
          intro:
            'Use as seções para filtrar por localização editorial, currículo e características específicas do recurso.',
        },
        {
          // Primeiro card (grade ou lista); sem resultados, a área inteira.
          selectors: [
            '#acervo-project-grid .grid > :first-child',
            '#acervo-project-grid .catalog-list > :first-child',
            '#acervo-project-grid',
          ],
          title: 'Abra a ficha do recurso',
          intro: 'Clique no card para ver descrição, BNCC, requisitos técnicos e o botão para abrir o recurso.',
        },
        {
          selectors: [
            '#acervo-project-grid .grid > :first-child button[aria-pressed]',
            '#acervo-project-grid .catalog-list > :first-child button[aria-pressed]',
          ],
          title: 'Guarde nos favoritos',
          intro: 'Use o coração para guardar o recurso e encontrá-lo depois.',
        },
        {
          selectors: ['[aria-label="Abrir menu do perfil"]'],
          title: 'Seu menu',
          intro: 'Aqui ficam seus favoritos e a opção de rever este tour.',
        },
      ].flatMap(({ selectors, title, intro }) => {
        const element = getVisibleElement(selectors);
        return element ? [{ element, title, intro }] : [];
      }),
    ];

    const intro = introJs();
    intro.setOptions({
      steps,
      showProgress: true,
      showButtons: true,
      showBullets: false,
      scrollToElement: true,
      scrollTo: 'tooltip',
      scrollPadding: 24,
      exitOnOverlayClick: false,
      overlayOpacity: 0.68,
      nextLabel: 'Próximo',
      prevLabel: 'Voltar',
      skipLabel: 'Pular tour',
      doneLabel: 'Começar a explorar',
      tooltipClass: 'acervo-onboarding-tooltip',
      highlightClass: 'acervo-onboarding-highlight',
    });

    intro.oncomplete(finishTour);
    intro.onexit(finishTour);

    activeTour = intro;
    // Marca como visto já na abertura: se o usuário recarregar no meio do tour,
    // ele não recomeça sozinho (e continua disponível no menu do perfil).
    markOnboardingDone();
    intro.start();
  }, 600);
}

