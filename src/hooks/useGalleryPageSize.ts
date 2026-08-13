import { useEffect, useState } from 'react';
import { galleryPageSize } from '../utils/galleryLayout';

export function useGalleryPageSize(viewMode: 'grid' | 'list'): number {
  const [pageSize, setPageSize] = useState(() =>
    galleryPageSize(viewMode, typeof window === 'undefined' ? 1280 : window.innerWidth)
  );

  useEffect(() => {
    const update = () => setPageSize(galleryPageSize(viewMode, window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [viewMode]);

  return pageSize;
}
