import { PrismaClient, produto_tipo, unidade_produto } from '@prisma/client';
import { categories } from '../src/catalog/seeds/catalog/categories.seed';
import { catalogs } from '../src/catalog/seeds/catalog';

interface CatalogSeedItem {
  categoria: string;
  produtos: {
    nome: string;
    tipo: produto_tipo;
    unidade_medida: unidade_produto;
  }[];
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding do catálogo...');

  // 1. Inserir Categorias Globais
  for (const cat of categories) {
    await prisma.categorias.upsert({
      where: { nome: cat.nome },
      update: { ordem: cat.ordem, descricao: cat.descricao },
      create: { nome: cat.nome, ordem: cat.ordem, descricao: cat.descricao },
    });
  }

  for (const catalog of catalogs as CatalogSeedItem[]) {
    const categoriaDb = await prisma.categorias.findUnique({
      where: { nome: catalog.categoria },
    });

    if (!categoriaDb) {
      console.warn(
        `⚠️ Categoria "${catalog.categoria}" não encontrada no banco. Pulando produtos.`,
      );
      continue;
    }

    for (const prod of catalog.produtos) {
      const existe = await prisma.catalogo_produtos.findFirst({
        where: {
          nome: prod.nome,
          categoria_id: categoriaDb.id,
        },
      });

      if (!existe) {
        await prisma.catalogo_produtos.create({
          data: {
            nome: prod.nome,
            tipo: prod.tipo,
            unidade_medida: prod.unidade_medida,
            categoria_id: categoriaDb.id,
            ativo: true,
          },
        });
      }
    }
  }

  console.log('✅ Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
