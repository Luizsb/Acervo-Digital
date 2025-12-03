// Mapeamento de siglas para nomes completos dos componentes curriculares
const componentNameMap: Record<string, string> = {
  // Língua Portuguesa
  'POR': 'Língua Portuguesa',
  'LP': 'Língua Portuguesa',
  'PORT': 'Língua Portuguesa',
  'PORTUGUÊS': 'Língua Portuguesa',
  'PORTUGUES': 'Língua Portuguesa',
  'LÍNGUA PORTUGUESA': 'Língua Portuguesa',
  'LINGUA PORTUGUESA': 'Língua Portuguesa',
  
  // Matemática
  'MAT': 'Matemática',
  'MATH': 'Matemática',
  'MATEMÁTICA': 'Matemática',
  'MATEMATICA': 'Matemática',
  
  // Ciências
  'CIE': 'Ciências',
  'CIÊNCIAS': 'Ciências',
  'CIENCIAS': 'Ciências',
  'SCI': 'Ciências',
  'SCIENCE': 'Ciências',
  
  // História
  'HIS': 'História',
  'HIST': 'História',
  'HISTÓRIA': 'História',
  'HISTORIA': 'História',
  'HISTORY': 'História',
  
  // Geografia
  'GEO': 'Geografia',
  'GEOG': 'Geografia',
  'GEOGRAFIA': 'Geografia',
  'GEOGRAPHY': 'Geografia',
  
  // Arte
  'ART': 'Arte',
  'ARTE': 'Arte',
  'ARTES': 'Arte',
  'ARTS': 'Arte',
  
  // Inglês
  'ING': 'Inglês',
  'INGLÊS': 'Inglês',
  'INGLES': 'Inglês',
  'ENG': 'Inglês',
  'ENGLISH': 'Inglês',
  
  // Espanhol
  'ESP': 'Espanhol',
  'ESPANHOL': 'Espanhol',
  'ESPAÑOL': 'Espanhol',
  'SPANISH': 'Espanhol',
  
  // Educação Física
  'EDF': 'Educação Física',
  'ED. FÍSICA': 'Educação Física',
  'ED. FISICA': 'Educação Física',
  'EDUCAÇÃO FÍSICA': 'Educação Física',
  'EDUCACAO FISICA': 'Educação Física',
  'EDUCATION PHYSICAL': 'Educação Física',
  'PE': 'Educação Física',
  
  // Filosofia
  'FIL': 'Filosofia',
  'FILOSOFIA': 'Filosofia',
  'PHIL': 'Filosofia',
  'PHILOSOPHY': 'Filosofia',
  
  // Sociologia
  'SOC': 'Sociologia',
  'SOCIOLOGIA': 'Sociologia',
  'SOCIOLOGY': 'Sociologia',
  
  // Química
  'QUI': 'Química',
  'QUÍMICA': 'Química',
  'QUIMICA': 'Química',
  'CHEM': 'Química',
  'CHEMISTRY': 'Química',
  
  // Física
  'FIS': 'Física',
  'FÍSICA': 'Física',
  'FISICA': 'Física',
  'PHYS': 'Física',
  'PHYSICS': 'Física',
  
  // Biologia
  'BIO': 'Biologia',
  'BIOLOGIA': 'Biologia',
  'BIOLOGY': 'Biologia',
  
  // Literatura
  'LIT': 'Literatura',
  'LITERATURA': 'Literatura',
  'LITERATURE': 'Literatura',
  
  // Blocos
  'BL3': 'Bloco 3',
  'BL4': 'Bloco 4',
  'BLOCO 3': 'Bloco 3',
  'BLOCO 4': 'Bloco 4',
};

// Função para converter sigla em nome completo
export function getComponentFullName(component: string): string {
  if (!component) return component;
  
  // Normalizar: remover espaços extras e converter para maiúsculas
  const normalized = component.trim().toUpperCase();
  
  // Verificar se já está no formato completo (verificar se começa com letra minúscula ou tem espaço)
  if (component !== normalized && component.includes(' ')) {
    // Provavelmente já está no formato completo
    return component;
  }
  
  // Buscar no mapeamento
  return componentNameMap[normalized] || component;
}

// Mapeamento de cores para componentes curriculares
// Cores diferentes das marcas (SPE: laranja, SAE: roxo, CQT: rosa)

export function getCurriculumColor(component: string): string {
  // Usar o nome completo para buscar a cor
  const fullName = getComponentFullName(component);
  
  const colorMap: Record<string, string> = {
    'Língua Portuguesa': 'bg-green-100 text-green-700 border-green-200',
    'Matemática': 'bg-blue-100 text-blue-700 border-blue-200',
    'Ciências': 'bg-teal-100 text-teal-700 border-teal-200',
    'História': 'bg-amber-100 text-amber-700 border-amber-200',
    'Geografia': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Arte': 'bg-violet-100 text-violet-700 border-violet-200',
    'Inglês': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Espanhol': 'bg-rose-100 text-rose-700 border-rose-200',
    'Educação Física': 'bg-lime-100 text-lime-700 border-lime-200',
    'Filosofia': 'bg-purple-100 text-purple-700 border-purple-200',
    'Sociologia': 'bg-pink-100 text-pink-700 border-pink-200',
    'Química': 'bg-orange-100 text-orange-700 border-orange-200',
    'Física': 'bg-red-100 text-red-700 border-red-200',
    'Biologia': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Literatura': 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return colorMap[fullName] || 'bg-gray-100 text-gray-700 border-gray-200';
}

// Mapeamento de siglas para nomes completos dos segmentos
const segmentNameMap: Record<string, string> = {
  'EI': 'Educação Infantil',
  'EDUCAÇÃO INFANTIL': 'Educação Infantil',
  'EDUCACAO INFANTIL': 'Educação Infantil',
  'ED. INFANTIL': 'Educação Infantil',
  'ED INFANTIL': 'Educação Infantil',
  'INFANTIL': 'Educação Infantil',
  
  'AI': 'Anos Iniciais',
  'ANOS INICIAIS': 'Anos Iniciais',
  'INICIAIS': 'Anos Iniciais',
  
  'AF': 'Anos Finais',
  'ANOS FINAIS': 'Anos Finais',
  'FINAIS': 'Anos Finais',
};

// Função para converter sigla de segmento em nome completo
export function getSegmentFullName(segment: string): string {
  if (!segment) return segment;
  
  // Normalizar: remover espaços extras e converter para maiúsculas
  const normalized = segment.trim().toUpperCase();
  
  // Verificar se já está no formato completo (verificar se tem espaço)
  if (segment.includes(' ') && segment !== normalized) {
    // Provavelmente já está no formato completo
    return segment;
  }
  
  // Buscar no mapeamento
  return segmentNameMap[normalized] || segment;
}

// Ordem específica para segmentos no filtro
export const SEGMENT_ORDER = ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'];

// Função para ordenar segmentos na ordem específica
export function sortSegments(segments: string[]): string[] {
  return segments.sort((a, b) => {
    const aFull = getSegmentFullName(a);
    const bFull = getSegmentFullName(b);
    const aIndex = SEGMENT_ORDER.indexOf(aFull);
    const bIndex = SEGMENT_ORDER.indexOf(bFull);
    
    // Se ambos estão na ordem definida, usar a ordem
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // Se apenas um está na ordem, ele vem primeiro
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // Se nenhum está na ordem, ordenar alfabeticamente
    return aFull.localeCompare(bFull);
  });
}

// Mapeamento de siglas para nomes completos das marcas
const marcaNameMap: Record<string, string> = {
  'CQT': 'Conquista',
  'CONQUISTA': 'Conquista',
  
  'SPE': 'Sistema Positivo',
  'SISTEMA POSITIVO': 'Sistema Positivo',
  'POSITIVO': 'Sistema Positivo',
  'SISTEMA POSITIVO DE ENSINO': 'Sistema Positivo',
  
  'SAE': 'SAE Digital',
  'SAE DIGITAL': 'SAE Digital',
  'DIGITAL': 'SAE Digital',
};

// Função para converter sigla de marca em nome completo
export function getMarcaFullName(marca: string): string {
  if (!marca) return marca;
  
  // Normalizar: remover espaços extras e converter para maiúsculas
  const normalized = marca.trim().toUpperCase();
  
  // Verificar se já está no formato completo (verificar se tem espaço e não é tudo maiúsculo)
  if (marca.includes(' ') && marca !== normalized) {
    // Provavelmente já está no formato completo
    return marca;
  }
  
  // Buscar no mapeamento
  return marcaNameMap[normalized] || marca;
}
