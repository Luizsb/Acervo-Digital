/**
 * Script para verificar se o Supabase está ativo e acessível
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['error'],
});

async function checkSupabase() {
  console.log('🔍 Verificando conexão com Supabase...\n');

  // Verificar se DATABASE_URL está configurada
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada no arquivo .env');
    console.log('📝 Certifique-se de que o arquivo server/.env existe e contém DATABASE_URL');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL encontrada');
  
  // Verificar se está usando pooler
  if (databaseUrl.includes('.pooler.supabase.com:5432')) {
    console.log('✅ Usando Supavisor Session Pooler (porta 5432) - Correto para server-based!\n');
  } else if (databaseUrl.includes('.pooler.supabase.com:6543')) {
    console.log('✅ Usando Supavisor Transaction Pooler (porta 6543) - Correto para serverless!\n');
  } else if (databaseUrl.includes(':5432') && databaseUrl.includes('db.') && !databaseUrl.includes('pooler')) {
    console.warn('⚠️  ATENÇÃO: Você está usando conexão direta (porta 5432)');
    console.warn('⚠️  Isso pode não funcionar com IPv4. Recomenda-se usar Supavisor Session Pooler');
    console.warn('📝 Veja GUIA-CONEXAO-SUPABASE.md para mais informações\n');
  } else {
    console.log('✅ Connection string configurada\n');
  }

  // Tentar conectar
  try {
    console.log('🔄 Tentando conectar ao banco de dados...');
    
    // Teste simples de conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Teste de query
    console.log('🔄 Testando query no banco...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Query executada com sucesso!');
    console.log('📊 Resultado:', result[0]);
    console.log('');

    // Verificar se as tabelas existem
    console.log('🔄 Verificando tabelas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log(`✅ Encontradas ${tables.length} tabelas:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    console.log('');

    // Verificar tabelas específicas do projeto
    const requiredTables = ['odas', 'bncc'];
    const existingTables = tables.map(t => t.table_name.toLowerCase());
    
    console.log('🔄 Verificando tabelas obrigatórias...');
    const missingTables = requiredTables.filter(
      table => !existingTables.includes(table)
    );
    
    if (missingTables.length === 0) {
      console.log('✅ Todas as tabelas obrigatórias existem!');
    } else {
      console.warn(`⚠️  Tabelas faltando: ${missingTables.join(', ')}`);
      console.warn('📝 Execute as migrations: npx prisma migrate deploy');
    }
    console.log('');

    // Contar registros
    try {
      const odasCount = await prisma.oDA.count();
      const bnccCount = await prisma.bNCC.count();
      console.log('📊 Contagem de registros:');
      console.log(`   - ODAs: ${odasCount}`);
      console.log(`   - BNCC: ${bnccCount}`);
    } catch (err) {
      console.warn('⚠️  Não foi possível contar registros (tabelas podem não existir)');
    }

    console.log('\n✅ Supabase está ATIVO e funcionando corretamente!');
    console.log('🚀 Você pode iniciar o servidor com: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Erro ao conectar ao Supabase:\n');
    console.error(error.message);
    console.error('');

    // Mensagens de ajuda baseadas no erro
    if (error.message.includes("Can't reach database server")) {
      console.error('🔧 Possíveis soluções:');
      console.error('   1. Verifique se o Supabase está ativo (não pausado)');
      console.error('   2. Use Session Pooler (porta 6543) ao invés de conexão direta');
      console.error('   3. Verifique a senha no arquivo .env');
      console.error('   4. Verifique firewall/antivírus');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔧 Possíveis soluções:');
      console.error('   1. Senha incorreta - verifique no Supabase Dashboard');
      console.error('   2. Se a senha tem caracteres especiais, use URL encoding');
      console.error('   3. Exemplo: @ vira %40');
    } else if (error.message.includes('does not exist')) {
      console.error('🔧 Possíveis soluções:');
      console.error('   1. Execute as migrations: npx prisma migrate deploy');
      console.error('   2. Verifique se o schema está correto');
    }

    console.error('\n📝 Veja GUIA-CONEXAO-SUPABASE.md para mais informações\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkSupabase().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

