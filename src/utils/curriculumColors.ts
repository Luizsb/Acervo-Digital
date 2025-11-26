// Mapeamento de cores para componentes curriculares
// Cores diferentes das marcas (SPE: laranja, SAE: roxo, CQT: rosa)

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
