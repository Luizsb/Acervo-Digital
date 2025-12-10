import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '..', 'public', 'ObjetosAudiovisual.xlsx');

if (!fs.existsSync(filePath)) {
  console.error('❌ Arquivo não encontrado:', filePath);
  process.exit(1);
}

console.log('📊 Analisando planilha ObjetosAudiovisual.xlsx...\n');

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Ler primeira linha (cabeçalhos)
const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })[0] as string[];

// Ler algumas linhas de dados para entender os valores
const sampleData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }).slice(1, 6) as any[];

console.log('📋 COLUNAS ENCONTRADAS:\n');
headers.forEach((col, i) => {
  if (col && col.trim() !== '') {
    console.log(`   ${i + 1}. ${col}`);
  }
});

console.log('\n📊 Total de colunas:', headers.filter(h => h && h.trim() !== '').length);

// Analisar tipos de dados
console.log('\n🔍 ANÁLISE DE DADOS (primeiras 5 linhas):\n');
sampleData.forEach((row, idx) => {
  console.log(`\n   Linha ${idx + 1}:`);
  headers.forEach((header, i) => {
    if (header && header.trim() !== '') {
      const value = row[i];
      if (value !== undefined && value !== null && value !== '') {
        console.log(`     ${header}: ${typeof value === 'string' ? value.substring(0, 50) : value}`);
      }
    }
  });
});

// Sugestão de categorização baseada nos nomes das colunas
console.log('\n\n🎯 SUGESTÃO DE CATEGORIZAÇÃO:\n');

const filterColumns: string[] = [];
const searchOnlyColumns: string[] = [];

headers.forEach((col) => {
  if (!col || col.trim() === '') return;
  
  const colLower = col.toLowerCase();
  
  // Colunas que provavelmente devem ser filtros (baseado na estrutura dos ODAs)
  if (
    colLower.includes('ano') || colLower.includes('série') || colLower.includes('serie') ||
    colLower.includes('componente') || colLower.includes('disciplina') || colLower.includes('matéria') ||
    colLower.includes('bncc') || colLower.includes('código bncc') || colLower.includes('codigo bncc') ||
    colLower.includes('segmento') || colLower.includes('marca') || colLower.includes('selo') ||
    colLower.includes('categoria') || colLower.includes('tipo') || colLower.includes('samr') ||
    colLower.includes('volume') || colLower.includes('vol')
  ) {
    filterColumns.push(col);
  } else if (
    colLower.includes('título') || colLower.includes('titulo') || colLower.includes('nome') ||
    colLower.includes('descrição') || colLower.includes('descricao') || colLower.includes('objetivo') ||
    colLower.includes('recurso') || colLower.includes('requisito') || colLower.includes('metodologia') ||
    colLower.includes('link') || colLower.includes('url') || colLower.includes('repositório') ||
    colLower.includes('duração') || colLower.includes('duracao') || colLower.includes('tempo')
  ) {
    searchOnlyColumns.push(col);
  } else {
    // Colunas não identificadas - adicionar a pesquisa por padrão
    searchOnlyColumns.push(col);
  }
});

console.log('✅ COLUNAS PARA FILTROS:');
filterColumns.forEach(col => console.log(`   - ${col}`));

console.log('\n🔍 COLUNAS APENAS PARA PESQUISA:');
searchOnlyColumns.forEach(col => console.log(`   - ${col}`));

console.log('\n\n📝 NOTA: Esta é uma categorização automática baseada nos nomes das colunas.');
console.log('   Revise e ajuste conforme necessário!\n');

