import introJs from 'intro.js';
import './onboarding.css';

const ONBOARDING_STORAGE_KEY = 'acervo-onboarding-v1';

/** Só existe na galeria; sem ele na tela, o tour não começa. */
const GALLERY_MARKER = '#acervo-content-type';

type TooltipPosition = 'right' | 'left' | 'bottom' | 'bottom-right-aligned';

type OnboardingStep = {
  element?: HTMLElement;
  title: string;
  intro: string;
  position?: TooltipPosition;
};

/** Largura do balão em `onboarding.css`, mais a seta e uma folga. */
const TOOLTIP_SPACE = 416 + 32;

const VIEWPORT_MARGIN = 16;
/** Tempo para o intro.js terminar de posicionar o balão depois da troca de passo. */
const TOOLTIP_SETTLE_MS = 350;

/**
 * O intro.js escolhe o lado do balão antes de rolar até o elemento, com a geometria
 * de antes da rolagem: em telas baixas ele punha o balão acima e o cortava. O lado
 * é decidido aqui: à direita ou à esquerda quando cabe na largura da tela; senão,
 * embaixo.
 */
function besideOrBelow(element: HTMLElement): TooltipPosition {
  const { left, right } = element.getBoundingClientRect();
  if (right + TOOLTIP_SPACE <= window.innerWidth) return 'right';
  if (left - TOOLTIP_SPACE >= 0) return 'left';
  return 'bottom';
}

/** A galeria rola dentro de `main.acervo-app-main`, não na janela. */
function scrollContainerOf(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

/**
 * O intro.js só rola quando o elemento está fora da tela, nunca pelo balão. A rolagem
 * é instantânea porque o destaque e o balão ficam fixos no documento: o `refresh`
 * os reposiciona sobre o elemento já no lugar novo.
 */
function keepTooltipInView(tour: IntroInstance, element: HTMLElement | undefined) {
  window.setTimeout(() => {
    const tooltip = document.querySelector<HTMLElement>('.acervo-onboarding-tooltip');
    const container = element ? scrollContainerOf(element) : null;
    if (!tooltip || !container || activeTour !== tour) return;

    const { top, bottom } = tooltip.getBoundingClientRect();
    let offset = 0;
    if (bottom > window.innerHeight - VIEWPORT_MARGIN) {
      offset = bottom - window.innerHeight + VIEWPORT_MARGIN;
    } else if (top < VIEWPORT_MARGIN) {
      offset = top - VIEWPORT_MARGIN;
    }
    if (offset === 0) return;

    container.scrollBy({ top: offset, behavior: 'auto' });
    tour.refresh();
  }, TOOLTIP_SETTLE_MS);
}

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
          position: (): TooltipPosition => 'bottom',
        },
        {
          selectors: ['#acervo-content-type'],
          title: 'Escolha o tipo de conteúdo',
          intro: 'Consulte todo o acervo ou restrinja os resultados a conteúdos audiovisuais ou objetos digitais.',
          position: (): TooltipPosition => 'bottom',
        },
        {
          selectors: ['#acervo-filters'],
          title: 'Refine os resultados',
          intro:
            'Use as seções para filtrar por localização editorial, currículo e características específicas do recurso.',
          position: besideOrBelow,
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
          position: besideOrBelow,
        },
        {
          selectors: [
            '#acervo-project-grid .grid > :first-child button[aria-pressed]',
            '#acervo-project-grid .catalog-list > :first-child button[aria-pressed]',
          ],
          title: 'Guarde nos favoritos',
          intro: 'Use o coração para guardar o recurso e encontrá-lo depois.',
          position: besideOrBelow,
        },
        {
          selectors: ['[aria-label="Abrir menu do perfil"]'],
          title: 'Seu menu',
          intro: 'Aqui ficam seus favoritos e a opção de rever este tour.',
          position: (): TooltipPosition => 'bottom-right-aligned',
        },
      ].flatMap(({ selectors, title, intro, position }) => {
        const element = getVisibleElement(selectors);
        return element ? [{ element, title, intro, position: position(element) }] : [];
      }),
    ];

    const intro = introJs();
    intro.setOptions({
      steps,
      showProgress: true,
      showButtons: true,
      showBullets: false,
      autoPosition: false,
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

    intro.onAfterChange((element) => keepTooltipInView(intro, element));
    intro.oncomplete(finishTour);
    intro.onexit(finishTour);

    activeTour = intro;
    // Marca como visto já na abertura: se o usuário recarregar no meio do tour,
    // ele não recomeça sozinho (e continua disponível no menu do perfil).
    markOnboardingDone();
    intro.start();
  }, 600);
}

