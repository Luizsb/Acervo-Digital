import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const favoriteService = {
  async getAll(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        oda: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.oda);
  },

  async add(userId: string, odaId: string) {
    // Check if ODA exists
    const oda = await prisma.oDA.findUnique({
      where: { id: odaId },
    });

    if (!oda) {
      throw new Error('ODA not found');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_odaId: {
          userId,
          odaId,
        },
      },
    });

    if (existing) {
      throw new Error('ODA already in favorites');
    }

    return prisma.favorite.create({
      data: {
        userId,
        odaId,
      },
      include: {
        oda: true,
      },
    });
  },

  async remove(userId: string, odaId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_odaId: {
          userId,
          odaId,
        },
      },
    });

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    return prisma.favorite.delete({
      where: {
        userId_odaId: {
          userId,
          odaId,
        },
      },
    });
  },

  async check(userId: string, odaId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_odaId: {
          userId,
          odaId,
        },
      },
    });

    return !!favorite;
  },
};

