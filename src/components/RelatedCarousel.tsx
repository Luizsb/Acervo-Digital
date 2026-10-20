import { Children, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './RelatedCarousel.css';

/** Abaixo disso o gesto conta como clique, não como arraste. */
const DRAG_THRESHOLD_PX = 6;

type DragState = { pointerId: number | null; startX: number; startScroll: number; moved: boolean };

export function RelatedCarousel({
  children,
  label,
  resetKey,
}: {
  children: ReactNode;
  label: string;
  /** Quando muda (outro recurso ou outro critério), a linha volta ao início. */
  resetKey: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ pointerId: null, startX: 0, startScroll: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const itemCount = Children.count(children);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    updateArrows();
  }, [resetKey, itemCount, updateArrows]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateArrows]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  };

  // Toque e trackpad já rolam nativamente; o arraste manual é só para o mouse.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !trackRef.current) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: trackRef.current.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (state.pointerId !== event.pointerId || !track) return;
    const deltaX = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
      state.moved = true;
      track.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    track.scrollLeft = state.startScroll - deltaX;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    if (trackRef.current?.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <div className="related-carousel">
      {canPrev && (
        <button
          type="button"
          className="related-carousel-arrow related-carousel-arrow--prev"
          onClick={() => scrollByPage(-1)}
          aria-label="Ver recursos anteriores"
        >
          <ChevronLeft />
        </button>
      )}

      <div
        ref={trackRef}
        className={`related-carousel-track ${isDragging ? 'related-carousel-track--dragging' : ''}`}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateArrows}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!drag.current.moved) return;
          drag.current.moved = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {Children.map(children, (child) => (
          <div className="related-carousel-item">{child}</div>
        ))}
      </div>

      {canNext && (
        <button
          type="button"
          className="related-carousel-arrow related-carousel-arrow--next"
          onClick={() => scrollByPage(1)}
          aria-label="Ver mais recursos"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
