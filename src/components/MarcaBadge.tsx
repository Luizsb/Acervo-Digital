import type { CSSProperties } from 'react';
import { getMarcaColor } from '../utils/curriculumColors';
import './MarcaBadge.css';

export function MarcaBadge({
  marca,
  className = '',
}: {
  marca?: string | null;
  className?: string;
}) {
  if (!marca?.trim()) return null;
  const color = getMarcaColor(marca);
  const style = color ? ({ '--marca-color': color } as CSSProperties) : undefined;
  return (
    <div
      className={`marca-badge inline-flex items-center text-xs font-semibold ${className}`.trim()}
      style={style}
      title="Marca"
    >
      {marca}
    </div>
  );
}
