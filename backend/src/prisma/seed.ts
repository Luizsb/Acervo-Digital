import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleODAs = [
  // ========== AUDIOVISUAIS (5) ==========
  {
    title: "Contação de Histórias: A Magia da Leitura",
    tag: "Língua Portuguesa",
    tags: ["Língua Portuguesa", "Literatura"],
    location: "1º ano",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF15LP15",
    bnccDescription:
      "Reconhecer que os textos literários fazem parte do mundo do imaginário",
    category: "Contação de história",
    duration: "15 min",
    volume: "Volume 1",
    livro: "Português 1º Ano",
    pagina: "42-48",
    marca: "CQT",
    contentType: "Audiovisual",
    videoCategory: "Contação de história",
    samr: "Ampliação",
    description:
      "Vídeo interativo de contação de histórias que desenvolve habilidades de leitura e interpretação de forma lúdica.",
    learningObjectives: [
      "Desenvolver habilidades de leitura e interpretação",
      "Estimular o pensamento crítico e a criatividade",
      "Promover a autonomia e o protagonismo dos estudantes",
    ],
    pedagogicalResources: [
      "Guia do professor com orientações didáticas",
      "Atividades complementares para impressão",
      "Sugestões de avaliação formativa",
    ],
    technicalRequirements: [
      "Navegador web atualizado",
      "Conexão com internet (mínimo 2 Mbps)",
    ],
    views: 0,
  },
  {
    title: "Aventuras Matemáticas: Adição e Subtração",
    tag: "Matemática",
    tags: ["Matemática"],
    location: "2º ano",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF02MA05",
    bnccDescription: "Construir fatos básicos da adição e subtração",
    category: "Aula Explicativa",
    duration: "20 min",
    volume: "Volume 2",
    livro: "Matemática 2º Ano",
    pagina: "35-42",
    marca: "SAE",
    contentType: "Audiovisual",
    videoCategory: "Aula Explicativa",
    samr: "Substituição",
    description:
      "Vídeo educativo que ensina operações básicas de adição e subtração através de situações do cotidiano.",
    learningObjectives: [
      "Compreender operações de adição e subtração",
      "Resolver problemas matemáticos simples",
      "Desenvolver raciocínio lógico",
    ],
    pedagogicalResources: [
      "Exercícios práticos",
      "Material de apoio para o professor",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Explorando a Natureza: Ciclo da Água",
    tag: "Ciências",
    tags: ["Ciências", "Meio Ambiente"],
    location: "3º ano",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF03CI05",
    bnccDescription: "Descrever e comunicar as alterações nos materiais",
    category: "Documentário Educativo",
    duration: "18 min",
    volume: "Volume 1",
    livro: "Ciências 3º Ano",
    pagina: "78-85",
    marca: "SPE",
    contentType: "Audiovisual",
    videoCategory: "Documentário Educativo",
    samr: "Modificação",
    description:
      "Documentário educativo sobre o ciclo da água, mostrando processos naturais de forma visual e interativa.",
    learningObjectives: [
      "Compreender o ciclo da água na natureza",
      "Identificar estados da matéria",
      "Desenvolver consciência ambiental",
    ],
    pedagogicalResources: [
      "Roteiro de atividades",
      "Experimentos práticos sugeridos",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "História do Brasil: Descobrimento",
    tag: "História",
    tags: ["História", "Geografia"],
    location: "4º ano",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF04HI01",
    bnccDescription:
      "Reconhecer a história como resultado da ação do ser humano",
    category: "Animação Educativa",
    duration: "25 min",
    volume: "Volume 3",
    livro: "História 4º Ano",
    pagina: "12-20",
    marca: "CQT",
    contentType: "Audiovisual",
    videoCategory: "Animação Educativa",
    samr: "Redefinição",
    description:
      "Animação educativa sobre o descobrimento do Brasil, apresentando fatos históricos de forma lúdica e envolvente.",
    learningObjectives: [
      "Conhecer fatos históricos do Brasil",
      "Desenvolver senso crítico sobre história",
      "Valorizar a cultura brasileira",
    ],
    pedagogicalResources: [
      "Linha do tempo interativa",
      "Atividades de fixação",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Arte e Expressão: Pintura e Cores",
    tag: "Arte",
    tags: ["Arte", "Criatividade"],
    location: "5º ano",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF15AR01",
    bnccDescription:
      "Identificar e apreciar formas distintas das artes visuais",
    category: "Tutorial",
    duration: "12 min",
    volume: "Volume 2",
    livro: "Arte 5º Ano",
    pagina: "55-62",
    marca: "SAE",
    contentType: "Audiovisual",
    videoCategory: "Tutorial",
    samr: "Ampliação",
    description:
      "Tutorial de arte ensinando técnicas básicas de pintura e uso de cores, estimulando a criatividade dos estudantes.",
    learningObjectives: [
      "Desenvolver habilidades artísticas",
      "Conhecer técnicas de pintura",
      "Expressar criatividade através da arte",
    ],
    pedagogicalResources: [
      "Material de apoio",
      "Sugestões de atividades práticas",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },

  // ========== OEDs - OBJETOS EDUCACIONAIS DIGITAIS (5) ==========
  {
    title: "Explorando Números e Quantidades",
    tag: "Matemática",
    tags: ["Matemática"],
    location: "1º ano",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    videoUrl: null,
    bnccCode: "EF01MA01",
    bnccDescription: "Utilizar números naturais como indicadores de quantidade",
    category: "Jogo Digital",
    duration: "15 min",
    volume: "Volume 1",
    livro: "Matemática 1º Ano",
    pagina: "10-18",
    marca: "SAE",
    contentType: "OED",
    tipoObjeto: "Clicar e Arrastar",
    samr: "Modificação",
    description:
      "Jogo interativo para explorar números e quantidades de forma lúdica, desenvolvendo habilidades matemáticas básicas.",
    learningObjectives: [
      "Reconhecer números naturais",
      "Associar números a quantidades",
      "Desenvolver raciocínio lógico",
    ],
    pedagogicalResources: ["Guia do professor", "Atividades complementares"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Formando Palavras: Alfabetização Interativa",
    tag: "Língua Portuguesa",
    tags: ["Língua Portuguesa", "Alfabetização"],
    location: "1º ano",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    videoUrl: null,
    bnccCode: "EF01LP03",
    bnccDescription: "Ler palavras com estrutura silábica canônica",
    category: "Jogo Educativo",
    duration: "20 min",
    volume: "Volume 1",
    livro: "Português 1º Ano",
    pagina: "25-32",
    marca: "CQT",
    contentType: "OED",
    tipoObjeto: "Quiz Interativo",
    samr: "Ampliação",
    description:
      "Objeto digital interativo para formação de palavras, auxiliando no processo de alfabetização.",
    learningObjectives: [
      "Reconhecer letras e sons",
      "Formar palavras simples",
      "Desenvolver habilidades de leitura",
    ],
    pedagogicalResources: [
      "Material de apoio pedagógico",
      "Atividades de reforço",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Quebra-cabeça Geográfico do Brasil",
    tag: "Geografia",
    tags: ["Geografia", "História"],
    location: "3º ano",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    videoUrl: null,
    bnccCode: "EF03GE01",
    bnccDescription: "Localizar-se no espaço geográfico",
    category: "Simulador",
    duration: "30 min",
    volume: "Volume 2",
    livro: "Geografia 3º Ano",
    pagina: "45-52",
    marca: "SPE",
    contentType: "OED",
    tipoObjeto: "Simulador",
    samr: "Redefinição",
    description:
      "Simulador interativo de quebra-cabeça para aprender sobre os estados e regiões do Brasil.",
    learningObjectives: [
      "Conhecer a geografia do Brasil",
      "Identificar estados e regiões",
      "Desenvolver noção espacial",
    ],
    pedagogicalResources: ["Mapas interativos", "Atividades complementares"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Laboratório Virtual de Ciências",
    tag: "Ciências",
    tags: ["Ciências", "Experimentos"],
    location: "4º ano",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    videoUrl: null,
    bnccCode: "EF04CI01",
    bnccDescription: "Identificar misturas homogêneas e heterogêneas",
    category: "Simulador",
    duration: "25 min",
    volume: "Volume 3",
    livro: "Ciências 4º Ano",
    pagina: "88-95",
    marca: "CQT",
    contentType: "OED",
    tipoObjeto: "Simulador",
    samr: "Modificação",
    description:
      "Simulador de laboratório virtual para realizar experimentos científicos de forma segura e interativa.",
    learningObjectives: [
      "Compreender conceitos científicos",
      "Realizar experimentos virtuais",
      "Desenvolver pensamento científico",
    ],
    pedagogicalResources: ["Roteiro de experimentos", "Material de apoio"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Calculadora Interativa de Operações",
    tag: "Matemática",
    tags: ["Matemática", "Cálculo"],
    location: "2º ano",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    videoUrl: null,
    bnccCode: "EF02MA05",
    bnccDescription: "Construir fatos básicos da adição e subtração",
    category: "Ferramenta Educativa",
    duration: "10 min",
    volume: "Volume 2",
    livro: "Matemática 2º Ano",
    pagina: "30-38",
    marca: "SAE",
    contentType: "OED",
    tipoObjeto: "Ferramenta",
    samr: "Substituição",
    description:
      "Ferramenta educativa interativa para praticar operações matemáticas básicas de forma divertida.",
    learningObjectives: [
      "Praticar operações matemáticas",
      "Desenvolver agilidade de cálculo",
      "Reforçar conceitos básicos",
    ],
    pedagogicalResources: ["Exercícios práticos", "Relatórios de progresso"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },

  // ========== ODAs ADICIONAIS PARA TESTE DE PAGINAÇÃO (5) ==========
  {
    title: "Inglês Divertido: Cores e Números",
    tag: "Língua Inglesa",
    tags: ["Língua Inglesa", "Alfabetização"],
    location: "1º ano",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF01LI01",
    bnccDescription:
      "Reconhecer palavras e expressões em inglês relacionadas ao cotidiano",
    category: "Aula Explicativa",
    duration: "15 min",
    volume: "Volume 1",
    livro: "Inglês 1º Ano",
    pagina: "20-28",
    marca: "CQT",
    contentType: "Audiovisual",
    videoCategory: "Aula Explicativa",
    samr: "Ampliação",
    description:
      "Vídeo educativo para ensinar cores e números em inglês de forma divertida e interativa.",
    learningObjectives: [
      "Aprender vocabulário básico em inglês",
      "Reconhecer cores e números",
      "Desenvolver interesse por língua estrangeira",
    ],
    pedagogicalResources: ["Cartões de vocabulário", "Atividades de fixação"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Educação Física: Movimentos e Coordenação",
    tag: "Educação Física",
    tags: ["Educação Física", "Saúde"],
    location: "2º ano",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF02EF01",
    bnccDescription: "Experimentar e fruir exercícios físicos",
    category: "Tutorial",
    duration: "22 min",
    volume: "Volume 1",
    livro: "Educação Física 2º Ano",
    pagina: "15-22",
    marca: "SAE",
    contentType: "Audiovisual",
    videoCategory: "Tutorial",
    samr: "Modificação",
    description:
      "Tutorial de educação física ensinando movimentos básicos e exercícios de coordenação motora.",
    learningObjectives: [
      "Desenvolver coordenação motora",
      "Praticar exercícios físicos",
      "Promover hábitos saudáveis",
    ],
    pedagogicalResources: ["Roteiro de exercícios", "Material de apoio"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Música e Ritmo: Sons e Instrumentos",
    tag: "Música",
    tags: ["Música", "Arte"],
    location: "3º ano",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
    videoUrl: null,
    bnccCode: "EF15AR02",
    bnccDescription: "Explorar e identificar elementos da música",
    category: "Jogo Educativo",
    duration: "18 min",
    volume: "Volume 2",
    livro: "Arte 3º Ano",
    pagina: "40-48",
    marca: "SPE",
    contentType: "OED",
    tipoObjeto: "Jogo Interativo",
    samr: "Ampliação",
    description:
      "Jogo interativo para explorar sons, ritmos e instrumentos musicais de forma lúdica.",
    learningObjectives: [
      "Reconhecer diferentes sons e instrumentos",
      "Desenvolver senso rítmico",
      "Apreciar música",
    ],
    pedagogicalResources: ["Guia do professor", "Atividades complementares"],
    technicalRequirements: [
      "Navegador web atualizado",
      "Conexão com internet",
      "Caixas de som recomendadas",
    ],
    views: 0,
  },
  {
    title: "Matemática Prática: Medidas e Grandezas",
    tag: "Matemática",
    tags: ["Matemática", "Medidas"],
    location: "4º ano",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    videoUrl: null,
    bnccCode: "EF04MA20",
    bnccDescription: "Medir e estimar comprimentos, massas e capacidades",
    category: "Simulador",
    duration: "25 min",
    volume: "Volume 3",
    livro: "Matemática 4º Ano",
    pagina: "65-72",
    marca: "CQT",
    contentType: "OED",
    tipoObjeto: "Simulador",
    samr: "Redefinição",
    description:
      "Simulador interativo para aprender sobre medidas, grandezas e unidades de medida.",
    learningObjectives: [
      "Compreender unidades de medida",
      "Estimar e medir grandezas",
      "Resolver problemas práticos",
    ],
    pedagogicalResources: ["Atividades práticas", "Material de apoio"],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
  {
    title: "Literatura Infantil: Fábulas e Contos",
    tag: "Língua Portuguesa",
    tags: ["Língua Portuguesa", "Literatura"],
    location: "5º ano",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bnccCode: "EF15LP18",
    bnccDescription: "Ler e compreender textos literários",
    category: "Contação de história",
    duration: "30 min",
    volume: "Volume 4",
    livro: "Português 5º Ano",
    pagina: "90-98",
    marca: "SAE",
    contentType: "Audiovisual",
    videoCategory: "Contação de história",
    samr: "Modificação",
    description:
      "Série de vídeos com contação de fábulas e contos infantis, desenvolvendo habilidades de leitura e interpretação.",
    learningObjectives: [
      "Desenvolver gosto pela leitura",
      "Compreender textos literários",
      "Interpretar fábulas e contos",
    ],
    pedagogicalResources: [
      "Textos complementares",
      "Atividades de interpretação",
    ],
    technicalRequirements: ["Navegador web atualizado", "Conexão com internet"],
    views: 0,
  },
];

// Helper para converter arrays para JSON (SQLite não suporta arrays nativos)
const arrayToJson = (arr: string[]): string => {
  return JSON.stringify(arr);
};

async function main() {
  console.log("🌱 Seeding database...");

  // Limpar dados existentes (opcional - comentar se quiser manter dados anteriores)
  console.log("🗑️  Limpando dados existentes...");
  await prisma.favorite.deleteMany();
  await prisma.oDA.deleteMany();

  // Create sample ODAs
  console.log("📚 Criando ODAs de teste...");
  for (const oda of sampleODAs) {
    await prisma.oDA.create({
      data: {
        ...oda,
        tags: arrayToJson(oda.tags),
        learningObjectives: arrayToJson(oda.learningObjectives),
        pedagogicalResources: arrayToJson(oda.pedagogicalResources),
        technicalRequirements: arrayToJson(oda.technicalRequirements),
      },
    });
  }

  const audiovisualCount = sampleODAs.filter(
    (o) => o.contentType === "Audiovisual"
  ).length;
  const oedCount = sampleODAs.filter((o) => o.contentType === "OED").length;

  console.log(`✅ Database seeded successfully!`);
  console.log(`   📹 ${audiovisualCount} Audiovisuais criados`);
  console.log(`   🎮 ${oedCount} OEDs criados`);
  console.log(`   📊 Total: ${sampleODAs.length} ODAs`);
  console.log(
    `   📄 Com ${Math.ceil(
      sampleODAs.length / 12
    )} páginas de paginação (12 ODAs por página)`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
