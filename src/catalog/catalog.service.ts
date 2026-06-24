import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCatalogProductDto } from './dto/add-catalog-product.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.categorias.findMany({
      orderBy: {
        ordem: 'asc',
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
      },
    });
  }

  async getProductsByCategory(categoryId: string) {
    const category = await this.prisma.categorias.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.catalogo_produtos.findMany({
      where: {
        categoria_id: categoryId,
        deleted_at: null,
        ativo: true,
      },
      orderBy: {
        nome: 'asc',
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        tipo: true,
        unidade_medida: true,
        imagem_url: true,
      },
    });
  }

  async addProductToStock(restauranteId: string, dto: AddCatalogProductDto) {
    const catalogProduct = await this.prisma.catalogo_produtos.findUnique({
      where: { id: dto.catalogoProdutoId },
    });

    if (!catalogProduct) {
      throw new NotFoundException('Produto do catálogo não encontrado');
    }

    const alreadyExists = await this.prisma.produtos.findFirst({
      where: {
        restaurante_id: restauranteId,
        catalogo_produto_id: catalogProduct.id,
        deleted_at: null,
      },
    });

    if (alreadyExists) {
      throw new BadRequestException(
        'Produto já adicionado ao estoque deste restaurante',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.produtos.create({
        data: {
          nome: catalogProduct.nome,
          descricao: catalogProduct.descricao,
          tipo: catalogProduct.tipo,
          unidade_medida: catalogProduct.unidade_medida,
          quantidade: dto.quantidade,
          restaurante_id: restauranteId,
          categoria_id: catalogProduct.categoria_id,
          catalogo_produto_id: catalogProduct.id,
          ativo: true,
          controla_estoque: true,
          preco: null,
        },
      });

      await tx.estoque_movimentacoes.create({
        data: {
          produto_id: product.id,
          restaurante_id: restauranteId,
          tipo: 'ENTRADA',
          quantidade: dto.quantidade,
          motivo: 'Adicionado via catálogo',
          referencia_tipo: 'ENTRADA_MANUAL',
        },
      });

      return product;
    });

    return {
      message: 'Produto adicionado com sucesso',
      produto: result,
    };
  }
}
