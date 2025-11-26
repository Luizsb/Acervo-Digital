import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Zerando visualizações de todos os ODAs...');
  
  const result = await prisma.oDA.updateMany({
    data: {
      views: 0,
    },
  });

  console.log(`✅ ${result.count} ODAs tiveram suas visualizações zeradas!`);
  
  // Mostrar estatísticas
  const stats = await prisma.oDA.findMany({
    select: {
      id: true,
      title: true,
      views: true,
    },
  });

  console.log('\n📊 Visualizações após reset:');
  stats.forEach((oda) => {
    console.log(`  - ${oda.title}: ${oda.views} visualizações`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro ao zerar visualizações:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

