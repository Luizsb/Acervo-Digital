import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper functions para converter entre arrays e JSON (SQLite não suporta arrays nativos)
const arrayToJson = (arr: string[] | undefined): string => {
  return JSON.stringify(arr || []);
};

const jsonToArray = (json: string | null | undefined): string[] => {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};

// Helper para transformar ODA retornado do banco (converte JSON strings para arrays)
const transformODA = (oda: any) => {
  return {
    ...oda,
    tags: jsonToArray(oda.tags),
    learningObjectives: jsonToArray(oda.learningObjectives),
    pedagogicalResources: jsonToArray(oda.pedagogicalResources),
    technicalRequirements: jsonToArray(oda.technicalRequirements),
  };
};

interface ODAFilters {
  search?: string;
  contentType?: string;
  anos?: string[];
  tags?: string[];
  bnccCodes?: string[];
  livros?: string[];
  categorias?: string[];
  marcas?: string[];
  tipoObjeto?: string[];
  videoCategory?: string[];
  samr?: string[];
  volumes?: string[];
}

export const odaService = {
  async getAll(filters: ODAFilters, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro por tipo de conteúdo
    if (filters.contentType && filters.contentType !== 'Todos') {
      where.contentType = filters.contentType;
    }

    // Filtro por anos
    if (filters.anos && filters.anos.length > 0) {
      where.location = { in: filters.anos };
    }

    // Filtro por códigos BNCC
    if (filters.bnccCodes && filters.bnccCodes.length > 0) {
      where.bnccCode = { in: filters.bnccCodes };
    }

    // Filtro por livros
    if (filters.livros && filters.livros.length > 0) {
      where.livro = { in: filters.livros };
    }

    // Filtro por categorias
    if (filters.categorias && filters.categorias.length > 0) {
      where.category = { in: filters.categorias };
    }

    // Filtro por marcas
    if (filters.marcas && filters.marcas.length > 0) {
      where.marca = { in: filters.marcas };
    }

    // Filtro por tipo de objeto (OED)
    if (filters.tipoObjeto && filters.tipoObjeto.length > 0) {
      where.tipoObjeto = { in: filters.tipoObjeto };
    }

    // Filtro por categoria de vídeo (Audiovisual)
    if (filters.videoCategory && filters.videoCategory.length > 0) {
      where.videoCategory = { in: filters.videoCategory };
    }

    // Filtro por SAMR
    if (filters.samr && filters.samr.length > 0) {
      where.samr = { in: filters.samr };
    }

    // Filtro por volumes
    if (filters.volumes && filters.volumes.length > 0) {
      where.volume = { in: filters.volumes };
    }

    // Construir condições OR para busca textual e tags
    const orConditions: any[] = [];

    // Busca textual (SQLite não suporta mode: 'insensitive', mas é case-insensitive por padrão)
    if (filters.search) {
      orConditions.push(
        { title: { contains: filters.search } },
        { tag: { contains: filters.search } },
        { location: { contains: filters.search } },
        { bnccCode: { contains: filters.search } },
        { category: { contains: filters.search } },
        { volume: { contains: filters.search } },
        { livro: { contains: filters.search } },
        { description: { contains: filters.search } },
        { bnccDescription: { contains: filters.search } }
      );
    }

    // Filtro por tags (componentes curriculares) - SQLite armazena como JSON string
    if (filters.tags && filters.tags.length > 0) {
      // Para cada tag, verificar se está contida no JSON string
      const tagFilters = filters.tags.map(tag => ({
        tags: { contains: `"${tag}"` } // Busca pela tag entre aspas no JSON
      }));
      orConditions.push(...tagFilters);
    }

    // Adicionar condições OR se houver
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const [odas, total] = await Promise.all([
      prisma.oDA.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.oDA.count({ where }),
    ]);

    // Transformar ODAs (converter JSON strings para arrays)
    const transformedODAs = odas.map(transformODA);

    return {
      data: transformedODAs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const oda = await prisma.oDA.findUnique({
      where: { id },
    });
    return oda ? transformODA(oda) : null;
  },

  async create(data: any) {
    const oda = await prisma.oDA.create({
      data: {
        title: data.title,
        tag: data.tag,
        tags: arrayToJson(data.tags || [data.tag]),
        tagColor: data.tagColor,
        location: data.location,
        image: data.image,
        videoUrl: data.videoUrl,
        bnccCode: data.bnccCode,
        bnccDescription: data.bnccDescription,
        category: data.category,
        duration: data.duration,
        volume: data.volume,
        livro: data.livro,
        pagina: data.pagina,
        marca: data.marca,
        contentType: data.contentType,
        videoCategory: data.videoCategory,
        tipoObjeto: data.tipoObjeto,
        samr: data.samr,
        description: data.description,
        learningObjectives: arrayToJson(data.learningObjectives || []),
        pedagogicalResources: arrayToJson(data.pedagogicalResources || []),
        technicalRequirements: arrayToJson(data.technicalRequirements || []),
      },
    });
    return transformODA(oda);
  },

  async update(id: string, data: any) {
    // Converter arrays para JSON se existirem
    const updateData: any = { ...data };
    if (data.tags) updateData.tags = arrayToJson(data.tags);
    if (data.learningObjectives) updateData.learningObjectives = arrayToJson(data.learningObjectives);
    if (data.pedagogicalResources) updateData.pedagogicalResources = arrayToJson(data.pedagogicalResources);
    if (data.technicalRequirements) updateData.technicalRequirements = arrayToJson(data.technicalRequirements);

    const oda = await prisma.oDA.update({
      where: { id },
      data: updateData,
    });
    return transformODA(oda);
  },

  async delete(id: string) {
    return prisma.oDA.delete({
      where: { id },
    });
  },

  async getRelated(id: string, limit: number = 3) {
    // Busca o ODA original
    const oda = await prisma.oDA.findUnique({
      where: { id },
    });

    if (!oda) {
      throw new Error('ODA not found');
    }

    // Busca ODAs relacionados (mesmo ano/série e tipo de conteúdo)
    const related = await prisma.oDA.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { location: oda.location },
          { contentType: oda.contentType },
        ],
      },
      take: limit,
      orderBy: { views: 'desc' },
    });

    return related.map(transformODA);
  },

  async incrementView(id: string, userId?: string, sessionId?: string) {
    // Usar transação para garantir atomicidade e evitar race conditions
    return prisma.$transaction(async (tx) => {
      // Buscar o registro atual
      const oda = await tx.oDA.findUnique({
        where: { id },
        select: { views: true },
      });

      if (!oda) {
        throw new Error('ODA not found');
      }

      // Verificar se já visualizou hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar visualizações de hoje
      const existingView = await tx.view.findFirst({
        where: {
          odaId: id,
          viewedAt: {
            gte: today,
            lt: tomorrow,
          },
          ...(userId ? { userId } : { sessionId }),
        },
      });

      // Se já visualizou hoje, não incrementa
      if (existingView) {
        console.log(`[Views] Visualização já registrada hoje para ODA ${id} (${userId ? `user: ${userId}` : `session: ${sessionId}`})`);
        return null; // Retorna null para indicar que não incrementou
      }

      // Criar registro de visualização
      await tx.view.create({
        data: {
          odaId: id,
          userId: userId || null,
          sessionId: sessionId || null,
        },
      });

      // Incrementar contador global atomicamente
      return tx.oDA.update({
        where: { id },
        data: {
          views: { increment: 1 },
        },
      });
    });
  },
};

