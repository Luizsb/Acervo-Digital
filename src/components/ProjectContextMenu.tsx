import React from 'react';
import type { Project } from '../types/project';
import { getResourceUrl, openResourceActionLabel } from '../utils/openResource';

interface ProjectContextMenuProps {
  project: Project;
  position: { x: number; y: number };
  onClose: () => void;
}

const itemClassName =
  'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors';
const disabledClassName =
  'block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed';

/** Abre sempre em nova guia: na mesma guia, a pessoa sairia do Acervo. */
export function ProjectContextMenu({ project, position, onClose }: ProjectContextMenuProps) {
  const url = getResourceUrl(project);
  const label = `${openResourceActionLabel(project)} em nova guia`;
  const left = Math.max(8, Math.min(position.x, window.innerWidth - 216));
  const top = Math.max(8, Math.min(position.y, window.innerHeight - 56));

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{ left, top }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          className={itemClassName}
          onClick={onClose}
        >
          {label}
        </a>
      ) : (
        <span role="menuitem" aria-disabled="true" className={disabledClassName}>
          {label}
        </span>
      )}
    </div>
  );
}
