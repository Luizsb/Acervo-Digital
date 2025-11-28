/**
 * @deprecated Use getCurriculumColor from '../utils/odaColors' instead
 * Este arquivo será removido em uma versão futura.
 * Mantido temporariamente para compatibilidade.
 */
import { getCurriculumColor as getColor } from './odaColors';

export function getCurriculumColor(component: string): string {
  return getColor(component);
}
