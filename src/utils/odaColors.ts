/**
 * Configuração centralizada de cores para ODAs
 * 
 * Este arquivo centraliza todas as configurações de cores que NÃO vêm do banco de dados.
 * As cores são calculadas dinamicamente baseadas nos valores dos campos do ODA.
 */

/**
 * Mapeamento de cores para componentes curriculares (tags)
 * Cores diferentes das marcas (SPE: laranja, SAE: roxo, CQT: rosa)
 */
export function getCurriculumColor(component: string): string {
  const colorMap: Record<string, string> = {
    'Língua Portuguesa': 'bg-green-100 text-green-700 border-green-200',
    'Matemática': 'bg-blue-100 text-blue-700 border-blue-200',
    'Ciências': 'bg-teal-100 text-teal-700 border-teal-200',
    'História': 'bg-amber-100 text-amber-700 border-amber-200',
    'Geografia': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Arte': 'bg-violet-100 text-violet-700 border-violet-200',
    'Inglês': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Educação Física': 'bg-lime-100 text-lime-700 border-lime-200',
  };

  return colorMap[component] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Mapeamento de cores para marcas (SPE, SAE, CQT)
 */
export function getMarcaColor(marca: string): string {
  const marcaColorMap: Record<string, string> = {
    'SPE': 'bg-secondary/10 text-secondary border-secondary/20',
    'SAE': 'bg-purple-100 text-purple-700 border-purple-200',
    'CQT': 'bg-pink-100 text-pink-700 border-pink-200',
  };

  return marcaColorMap[marca] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Cores para tags secundárias (quando há múltiplas tags)
 * Usado quando o ODA tem mais de uma tag
 */
export const secondaryTagColors = {
  first: 'bg-secondary/10 text-secondary border-secondary/20',
  second: 'bg-gray-100 text-gray-700 border-gray-200',
} as const;

/**
 * Cores para tags em modais (versão com gradiente)
 * Usado no ProjectModal para um visual mais destacado
 * 
 * @param index - Índice da tag (0 para primeira, 1 para segunda, etc)
 * @param tag - Nome da tag para calcular cor baseada no componente curricular (opcional)
 */
export function getModalTagColor(index: number, tag?: string): string {
  // Para a primeira tag, podemos usar um gradiente baseado no componente curricular
  // Por enquanto, usando gradientes padrão que funcionam bem visualmente
  const modalColors = [
    'bg-gradient-to-r from-purple-500 to-indigo-600',
    'bg-gradient-to-r from-cyan-500 to-blue-600',
  ];
  
  return modalColors[index % modalColors.length] || 'bg-gradient-to-r from-gray-500 to-gray-600';
}

