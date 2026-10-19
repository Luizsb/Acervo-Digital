import React from 'react';
import { isAdminRole } from '../utils/catalogVisibility';
import './RoleBadge.css';

interface RoleBadgeProps {
  role?: string | null;
  /** `anchored`: sobreposto à borda inferior do botão de perfil. `inline`: no fluxo do texto. */
  variant?: 'anchored' | 'inline';
}

/** Identifica o perfil administrador. Usuário comum não recebe etiqueta. */
export function RoleBadge({ role, variant = 'anchored' }: RoleBadgeProps) {
  if (!isAdminRole(role)) return null;
  return (
    <span className={`acervo-role-badge acervo-role-badge--${variant}`}>
      {variant === 'inline' ? 'Administrador' : 'Admin'}
    </span>
  );
}
