import * as XLSX from 'xlsx';

// Imagem padrão genérica (fallback quando não há thumb)
export const DEFAULT_ODA_IMAGE = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

export interface ODAFromExcel {
  id: number;
  title: string;
  tag: string;
  tags?: string[];
  tagColor: string;
  location: string;
  image: string;
  videoUrl?: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  segmento?: string;
  pagina?: string;
  marca?: string;
  contentType: 'Audiovisual' | 'OED';
  videoCategory?: string;
  samr?: string;
  tipoObjeto?: string;
  description?: string;
  learningObjectives?: string[];
  pedagogicalResources?: string[];
  technicalRequirements?: string;
  metodologiaPdfUrl?: string;
  status?: string;
  codigoODA?: string; // Código do ODA para referência futura (imagens)
}

// Mapeamento de cores por componente curricular
const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    'Língua Portuguesa': 'bg-blue-600',
    'Matemática': 'bg-yellow-600',
    'Ciências': 'bg-green-600',
    'História': 'bg-purple-600',
    'Geografia': 'bg-amber-600',
    'Arte': 'bg-pink-600',
    'Inglês': 'bg-indigo-600',
    'Educação Física': 'bg-lime-600',
  };
  return colors[tag] || 'bg-gray-600';
};

// Função auxiliar para buscar coluna por padrões (case-insensitive e com variações)
const findColumn = (row: Record<string, any>, patterns: string[]): string => {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const found = keys.find((key) =>
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    if (found) {
      const value = row[found];
      return value ? String(value) : '';
    }
  }
  return '';
};

// Função para mapear dados da planilha para estrutura do ODA
const mapRowToODA = (row: any, index: number): ODAFromExcel | null => {
  // Mapeamento flexível que aceita variações nos nomes das colunas
  
  const title = findColumn(row, ['Título recurso', 'Titulo recurso', 'Título', 'Titulo', 'Nome']);
  const tag = findColumn(row, ['Componente curricular', 'Componente Curricular', 'Componente', 'Matéria', 'Disciplina']);
  const location = findColumn(row, ['Ano/Série', 'Ano/Série', 'Ano', 'Série', 'Ano/Série']);
  const volume = findColumn(row, ['Volume', 'Vol']);
  const segmento = findColumn(row, ['Segmento', 'Segmentos']);
  const marca = findColumn(row, ['Selos', 'Selo', 'Marca', 'Editora']);

  // A coluna BNCC está na coluna L com o nome exato "BNCC"
  // Procurar primeiro pelo nome exato "BNCC" (case-insensitive), depois por variações
  const rowKeys = Object.keys(row);
  let bnccKey = rowKeys.find((key) => {
    const normalized = key.trim();
    return normalized === 'BNCC' || normalized === 'Bncc' || normalized === 'bncc';
  });
  
  // Se não encontrou exato, procurar por qualquer variação que contenha BNCC
  if (!bnccKey) {
    bnccKey = rowKeys.find((key) => 
      key.trim().toLowerCase().includes('bncc')
    ) || '';
  }
  
  let bnccCode = '';
  if (bnccKey) {
    const value = row[bnccKey];
    // Converter para string e normalizar - importante para valores numéricos do Excel
    if (value !== null && value !== undefined && value !== '') {
      bnccCode = String(value).trim();
      // Se for vazio após conversão, manter vazio
      if (bnccCode === '' || bnccCode === 'undefined' || bnccCode === 'null') {
        bnccCode = '';
      }
    }
  }

  const codigoODA = findColumn(row, ['Código', 'Codigo', 'ID', 'Id']); // Código do ODA (para imagens)
  const tipoObjeto = findColumn(row, ['Tipo de Objeto Digital', 'Tipo de Objeto', 'Tipo Objeto', 'Tipo']);
  const samr = findColumn(row, ['Escala SAMR', 'SAMR', 'Escala', 'Samr']);
  // Coluna H - Link do ODA (tentar várias variações de nome)
  const videoUrl = findColumn(row, ['Link', 'Link repositório', 'Link Repositório', 'Link do ODA', 'Link ODA', 'URL', 'Url', 'Link repositório', 'Repositório', 'Repositorio']);
  const status = findColumn(row, ['Status', 'Estado']);
  
  // Função para gerar o caminho da thumb baseado no código do ODA
  // As thumbs estão em public/thumbs e são nomeadas pelo código do ODA
  const getThumbPath = (codigo: string): string | null => {
    if (!codigo || codigo.trim() === '') {
      return null;
    }
    // Normalizar o código (remover espaços, converter para string)
    // Remover extensões se já existirem no código
    let normalizedCode = String(codigo).trim();
    // Remover extensões comuns se já estiverem no código
    normalizedCode = normalizedCode.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    // As thumbs estão principalmente em formato .webp
    return `/thumbs/${normalizedCode}.webp`;
  };
  
  // Tentar usar a thumb do código do ODA, senão usar a padrão
  // O componente de imagem vai usar onError para fazer fallback se a thumb não existir
  const thumbPath = codigoODA && codigoODA.trim() !== '' ? getThumbPath(codigoODA) : null;
  const image = thumbPath || DEFAULT_ODA_IMAGE;
  
  // Validação básica - se não tiver título, pula
  if (!title) return null;

  return {
    id: index + 1, // ID será ajustado no App.tsx
    title,
    tag,
    tags: tag ? [tag] : [],
    tagColor: getTagColor(tag),
    location,
    image,
    videoUrl: videoUrl || undefined,
    bnccCode: bnccCode && bnccCode.trim() !== '' ? bnccCode.trim() : undefined,
    volume: volume || undefined,
    segmento: segmento || undefined,
    marca: marca || undefined,
    contentType: 'OED' as 'Audiovisual' | 'OED', // Todos da planilha são ODAs
    samr: samr || undefined,
    tipoObjeto: tipoObjeto || undefined,
    // Campos opcionais
    category: tipoObjeto || undefined, // Usa tipoObjeto como category também
    technicalRequirements: undefined, // Usará o padrão
    status: status || undefined, // Status (Ativo, etc.)
    codigoODA: codigoODA || undefined, // Código do ODA para referência futura
  };
};

// Função principal para importar ODAs do Excel
export const importODAsFromExcel = async (): Promise<ODAFromExcel[]> => {
  try {
    // Importar o arquivo Excel da pasta public/
    const response = await fetch('/ObjetosDigitais.xlsx');
    
    if (!response.ok) {
      console.warn('Arquivo Excel não encontrado em /ObjetosDigitais.xlsx. Verifique se o arquivo está na pasta public/.');
      return [];
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return processWorkbook(workbook);
  } catch (error) {
    console.error('Erro ao importar ODAs do Excel:', error);
    return [];
  }
};

// Função auxiliar para processar o workbook
const processWorkbook = (workbook: XLSX.WorkBook): ODAFromExcel[] => {
  // Pegar a primeira planilha
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Converter para JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  // Log temporário para verificar as colunas da planilha atualizada
  if (jsonData.length > 0) {
    const firstRow = jsonData[0] as Record<string, any>;
    const allKeys = Object.keys(firstRow);
    console.log('=== DEBUG PLANILHA ===');
    console.log('Total de colunas encontradas:', allKeys.length);
    console.log('Nomes das colunas:', allKeys);
    
    // Log específico para BNCC
    const bnccKeys = allKeys.filter(key => {
      const normalized = key.trim().toLowerCase();
      return normalized === 'bncc' || 
             normalized.includes('bncc') ||
             normalized.startsWith('bncc');
    });
    console.log('Chaves BNCC encontradas:', bnccKeys);
    if (bnccKeys.length > 0) {
      bnccKeys.forEach(key => {
        console.log(`  - "${key}": valor = "${firstRow[key]}" (tipo: ${typeof firstRow[key]})`);
      });
    } else {
      console.warn('⚠️ NENHUMA chave BNCC encontrada! Verifique o nome da coluna na planilha.');
    }
    
    // Verificar todas as colunas que podem ser BNCC
    const possibleBncc = allKeys.filter(key => {
      const val = firstRow[key];
      if (val && typeof val === 'string' && val.match(/^EF\d{2}[A-Z]{2}\d{2}$/)) {
        return true;
      }
      return false;
    });
    if (possibleBncc.length > 0) {
      console.log('Colunas que parecem conter códigos BNCC:', possibleBncc);
    }
  }
  
  // Log dos códigos BNCC únicos encontrados após processamento
  const allBnccCodes = jsonData
    .map((row: any, idx: number) => {
      const rowKeys = Object.keys(row);
      const bnccKey = rowKeys.find((key) => {
        const normalized = key.trim().toLowerCase();
        return normalized === 'bncc' || normalized.includes('bncc');
      });
      
      if (bnccKey) {
        const value = row[bnccKey];
        if (value !== null && value !== undefined) {
          return String(value).trim();
        }
      }
      return '';
    })
    .filter((code: string) => code !== '' && code !== 'undefined' && code !== 'null');
  
  const uniqueBnccCodes = Array.from(new Set(allBnccCodes));
  console.log(`\n=== RESULTADO BNCC ===`);
  console.log(`Total de linhas processadas: ${jsonData.length}`);
  console.log(`Códigos BNCC encontrados (com duplicatas): ${allBnccCodes.length}`);
  console.log(`Códigos BNCC únicos: ${uniqueBnccCodes.length}`);
  if (uniqueBnccCodes.length > 0) {
    console.log('Primeiros 30 códigos BNCC:', uniqueBnccCodes.slice(0, 30));
    if (uniqueBnccCodes.length > 30) {
      console.log(`... e mais ${uniqueBnccCodes.length - 30} códigos`);
    }
  } else {
    console.error('❌ ERRO: Nenhum código BNCC foi encontrado!');
  }
  
  // Mapear para estrutura de ODA
  const odas = jsonData
    .map((row, index) => mapRowToODA(row, index))
    .filter((oda): oda is ODAFromExcel => oda !== null);
  
  return odas;
};

// Função para importar apenas ODAs (não vídeo aulas)
export const importODAsOnly = async (): Promise<ODAFromExcel[]> => {
  const allODAs = await importODAsFromExcel();
  // Filtrar apenas ODAs (não Audiovisual)
  return allODAs.filter(oda => oda.contentType === 'OED');
};

