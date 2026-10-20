import type { Prisma } from '@prisma/client';
import prisma from './prisma';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'catalog.import'
  | 'catalog.import_failed'
  | 'catalog.resource_created'
  | 'catalog.resource_updated'
  | 'catalog.resource_deleted';

/** De onde o evento partiu. `banco` e `supabase` são gravados por gatilhos SQL, não por aqui. */
export type AuditOrigin = 'express' | 'cli' | 'apps-script';

export type AuditEventInput = {
  action: AuditAction;
  origin: AuditOrigin;
  actor?: string | null;
  target?: string | null;
  ip?: string | null;
  details?: Prisma.InputJsonValue;
};

const MAX_TEXT = 254;

function clip(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.length > MAX_TEXT ? value.slice(0, MAX_TEXT) : value;
}

/**
 * Grava um evento na trilha de auditoria. Falha de gravação é registrada no log do servidor
 * e não interrompe a operação auditada: auditoria indisponível não pode derrubar o login.
 */
export async function recordAuditEvent(event: AuditEventInput): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        action: event.action,
        origin: event.origin,
        actor: clip(event.actor),
        target: clip(event.target),
        ip: clip(event.ip),
        details: event.details,
      },
    });
  } catch (error) {
    console.error(`Falha ao gravar evento de auditoria (${event.action}):`, error);
  }
}
