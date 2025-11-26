// Script para consultar o banco de dados SQLite
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Consultando banco de dados...\n');

  // Contar registros
  const userCount = await prisma.user.count();
  const odaCount = await prisma.oDA.count();
  const favoriteCount = await prisma.favorite.count();

  console.log('📈 Estatísticas:');
  console.log(`   Usuários: ${userCount}`);
  console.log(`   ODAs: ${odaCount}`);
  console.log(`   Favoritos: ${favoriteCount}\n`);

  // Listar usuários
  if (userCount > 0) {
    console.log('👥 Usuários:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || 'Sem nome'} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Criado em: ${user.createdAt.toLocaleString('pt-BR')}\n`);
    });
  }

  // Listar ODAs
  if (odaCount > 0) {
    console.log('📚 ODAs (primeiros 5):');
    const odas = await prisma.oDA.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        contentType: true,
        tag: true,
        location: true,
        views: true,
      },
    });
    odas.forEach((oda, index) => {
      console.log(`   ${index + 1}. ${oda.title}`);
      console.log(`      Tipo: ${oda.contentType} | Tag: ${oda.tag} | Local: ${oda.location}`);
      console.log(`      Visualizações: ${oda.views}\n`);
    });
  }

  // Listar favoritos
  if (favoriteCount > 0) {
    console.log('❤️ Favoritos:');
    const favorites = await prisma.favorite.findMany({
      include: {
        user: {
          select: { email: true },
        },
        oda: {
          select: { title: true },
        },
      },
    });
    favorites.forEach((fav, index) => {
      console.log(`   ${index + 1}. ${fav.user.email} favoritou: ${fav.oda.title}`);
      console.log(`      Criado em: ${fav.createdAt.toLocaleString('pt-BR')}\n`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

