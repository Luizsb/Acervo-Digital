import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

function getGalleryScroller(): HTMLElement | null {
  return document.querySelector('.acervo-app-main');
}

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scroller = getGalleryScroller();
      const offset = scroller ? scroller.scrollTop : window.scrollY;
      setIsVisible(offset > 300);
    };

    const scroller = getGalleryScroller();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => {
      target.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const scroller = getGalleryScroller();
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="acervo-fab-scroll"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ChevronUp className="w-6 h-6 text-white" />
    </button>
  );
}
