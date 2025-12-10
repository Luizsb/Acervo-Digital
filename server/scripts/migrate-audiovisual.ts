import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Função auxiliar para encontrar coluna
function findColumn(row: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return String(row[name]).trim();
    }
  }
  return '';
}

// Função para mapear linha da planilha para Audiovisual
function mapRowToAudiovisual(row: any): any {
  const codigo = findColumn(row, ['Código', 'Codigo', 'ID', 'Id']);
  const marca = findColumn(row, ['Marca', 'Selos', 'Selo', 'Editora']);
  const segmento = findColumn(row, ['Segmento', 'Segmentos']);
  const anoSerieModulo = findColumn(row, ['Ano/série/Módulo', 'Ano/série/Módulo', 'Ano/Série/Módulo', 'Ano/Série', 'Ano', 'Série', 'Módulo']);
  const volume = findColumn(row, ['Volume', 'Vol']);
  const componente = findColumn(row, ['Componente', 'Componente Curricular', 'Componente curricular', 'Matéria', 'Disciplina']);
  const capitulo = findColumn(row, ['Capítulo', 'Capitulo', 'Cap', 'Cap.']);
  const nomeCapitulo = findColumn(row, ['Nome do Capítulo', 'Nome do Capitulo', 'Nome Capítulo', 'Nome Capitulo', 'Nome do Cap']);
  const categoriaVideo = findColumn(row, ['Categoria de Vídeo', 'Categoria de Video', 'Categoria Vídeo', 'Categoria Video', 'Categoria do vídeo', 'Categoria']);
  const vestibular = findColumn(row, ['Vestibular']);
  const enunciado = findColumn(row, ['Enunciado', 'Questão', 'Questao']);
  const link = findColumn(row, ['Link', 'Link repositório', 'Link Repositório', 'URL', 'Url', 'Repositório', 'Repositorio']);

  // Gerar caminho da thumb baseado no código
  const getThumbPath = (codigo: string): string | null => {
    if (!codigo || codigo.trim() === '') {
      return null;
    }
    let normalizedCode = String(codigo).trim();
    normalizedCode = normalizedCode.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    return `/thumbs/${normalizedCode}.webp`;
  };

  const thumbPath = codigo && codigo.trim() !== '' ? getThumbPath(codigo) : null;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
  const image = thumbPath || DEFAULT_IMAGE;

  return {
    codigo: codigo || null,
    marca: marca || null,
    segmento: segmento || null,
    anoSerieModulo: anoSerieModulo || null,
    volume: volume || null,
    componente: componente || null,
    capitulo: capitulo || null,
    nomeCapitulo: nomeCapitulo || null,
    categoriaVideo: categoriaVideo || null,
    vestibular: vestibular || null,
    enunciado: enunciado || null,
    link: link || null,
    imagem: image,
  };
}

async function migrateAudiovisual() {
  try {
    console.log('🚀 Iniciando migração de ObjetosAudiovisual.xlsx...\n');

    // Encontrar arquivo
    const possiblePaths = [
      path.join(process.cwd(), '..', 'public', 'ObjetosAudiovisual.xlsx'),
      path.join(process.cwd(), 'public', 'ObjetosAudiovisual.xlsx'),
      path.join(__dirname, '..', '..', 'public', 'ObjetosAudiovisual.xlsx'),
    ];

    let finalPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        finalPath = p;
        break;
      }
    }

    if (!finalPath) {
      throw new Error('Planilha ObjetosAudiovisual.xlsx não encontrada');
    }

    console.log(`📊 Lendo planilha: ${finalPath}\n`);

    // Ler planilha
    const workbook = XLSX.readFile(finalPath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      console.log('⚠️ Planilha vazia');
      return;
    }

    console.log(`📋 ${jsonData.length} linhas encontradas na planilha\n`);

    const errors: string[] = [];
    let imported = 0;
    let updated = 0;

    // Processar cada linha
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as any;
        const audiovisualData = mapRowToAudiovisual(row);

        if (!audiovisualData.codigo && !audiovisualData.nomeCapitulo) {
          errors.push(`Linha ${i + 1}: código e nome do capítulo vazios, pulando...`);
          continue;
        }

        // Verificar se já existe
        const existing = audiovisualData.codigo
          ? await prisma.audiovisual.findUnique({ where: { codigo: audiovisualData.codigo } })
          : await prisma.audiovisual.findFirst({ where: { nomeCapitulo: audiovisualData.nomeCapitulo } });

        if (existing) {
          // Atualizar existente
          await prisma.audiovisual.update({
            where: { id: existing.id },
            data: audiovisualData,
          });
          updated++;
        } else {
          // Criar novo
          await prisma.audiovisual.create({ data: audiovisualData });
          imported++;
        }

        if ((i + 1) % 50 === 0) {
          console.log(`✅ ${i + 1}/${jsonData.length} processados... (${imported} novos, ${updated} atualizados)`);
        }
      } catch (error: any) {
        const errorMsg = `Erro ao migrar linha ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`\n✅ Migração concluída!`);
    console.log(`   📥 ${imported} novos audiovisuais importados`);
    console.log(`   🔄 ${updated} audiovisuais atualizados`);
    console.log(`   ❌ ${errors.length} erros`);
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log(`\n⚠️ Erros encontrados:`);
      errors.forEach(err => console.log(`   - ${err}`));
    } else if (errors.length > 10) {
      console.log(`\n⚠️ ${errors.length} erros encontrados (mostrando primeiros 10):`);
      errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    }

  } catch (error: any) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateAudiovisual()
  .then(() => {
    console.log('\n🎉 Migração finalizada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

