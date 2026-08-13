import React from 'react';

interface BrandMarkProps {
  className?: string;
  title?: string;
}

/** Marca do Acervo: fichas empilhadas e marcador coral (opção 3). */
export function BrandMark({ className, title = 'Acervo Digital' }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <rect width="48" height="48" rx="12" fill="#012451" />
      <rect x="9" y="10" width="21" height="27" rx="3.5" fill="#fff" opacity="0.42" />
      <rect x="13.5" y="12" width="21" height="27" rx="3.5" fill="#fff" opacity="0.72" />
      <rect x="18" y="14" width="21" height="27" rx="3.5" fill="#fff" />
      <path d="M33.5 14h6v14.5l-3-2.4-3 2.4V14z" fill="#f05039" />
    </svg>
  );
}
