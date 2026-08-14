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

export function ProjectContextMenu({ project, position, onClose }: ProjectContextMenuProps) {
  const url = getResourceUrl(project);
  const openLabel = openResourceActionLabel(project);
  const left = Math.max(8, Math.min(position.x, window.innerWidth - 196));
  const top = Math.max(8, Math.min(position.y, window.innerHeight - 96));

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{ left, top }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      {url ? (
        <>
          <a href={url} role="menuitem" className={itemClassName} onClick={onClose}>
            {openLabel}
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClassName}
            onClick={onClose}
          >
            Abrir em nova guia
          </a>
        </>
      ) : (
        <>
          <span role="menuitem" aria-disabled="true" className={disabledClassName}>
            {openLabel}
          </span>
          <span role="menuitem" aria-disabled="true" className={disabledClassName}>
            Abrir em nova guia
          </span>
        </>
      )}
    </div>
  );
}
