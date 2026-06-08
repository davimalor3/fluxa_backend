import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { produto_tipo } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/types/auth-user.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateFichaTecnicaDto } from './dto/create-ficha-tecnica.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private readonly productSelect = {
    id: true,
    nome: true,
    descricao: true,
    preco: true,
    quantidade: true,
    tipo: true,
    unidade_medida: true,
    ativo: true,
    controla_estoque: true,
    restaurante_id: true,
    created_at: true,
    updated_at: true,
  };

  // ================================================================ MÉTODO PARA PRDUTOS E INSUMOS

  async create(dto: CreateProductDto, user: AuthUser) {
    const existing = await this.prisma.produtos.findFirst({
      where: {
        nome: dto.nome,
        restaurante_id: user.restaurante_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Já existe um produto com este nome');
    }

    return this.prisma.produtos.create({
      data: {
        ...dto,
        restaurante_id: user.restaurante_id,
      },
      select: this.productSelect,
    });
  }

  async findAll(restauranteId: string) {
    return this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
      },
      select: this.productSelect,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findProdutos(restauranteId: string) {
    return this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
        tipo: {
          in: [produto_tipo.PRODUTO_SIMPLES, produto_tipo.PRODUTO_COMPOSTO],
        },
      },
      select: this.productSelect,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findInsumos(restauranteId: string) {
    return this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
        tipo: produto_tipo.INSUMO,
      },
      select: this.productSelect,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, restauranteId: string) {
    const product = await this.prisma.produtos.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
      select: this.productSelect,
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, restauranteId: string) {
    await this.findOne(id, restauranteId);

    if (dto.nome) {
      const duplicated = await this.prisma.produtos.findFirst({
        where: {
          nome: dto.nome,
          restaurante_id: restauranteId,
          deleted_at: null,
          id: {
            not: id,
          },
        },
      });

      if (duplicated) {
        throw new BadRequestException('Já existe um produto com este nome');
      }
    }

    return this.prisma.produtos.update({
      where: {
        id,
      },
      data: dto,
      select: this.productSelect,
    });
  }

  async remove(id: string, restauranteId: string) {
    await this.findOne(id, restauranteId);

    await this.prisma.produtos.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Produto removido com sucesso',
    };
  }

  // =========================================================================== MÉTODOS PARA FICHA TÉCNICA

  async addFichaTecnica(
    produtoId: string,
    dto: CreateFichaTecnicaDto,
    restauranteId: string,
  ) {
    if (Number(dto.quantidade) <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    const produto = await this.prisma.produtos.findFirst({
      where: {
        id: produtoId,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    // apenas produtos compostos possuem ficha tecnica
    if (produto.tipo !== produto_tipo.PRODUTO_COMPOSTO) {
      throw new BadRequestException(
        'Somente produtos compostos podem possuir ficha técnica',
      );
    }

    // validacao q impede produto ser insumo dele msm
    if (produtoId === dto.insumo_id) {
      throw new BadRequestException('Produto não pode ser insumo de si mesmo');
    }

    const insumo = await this.prisma.produtos.findFirst({
      where: {
        id: dto.insumo_id,
        restaurante_id: restauranteId,
        tipo: produto_tipo.INSUMO,
        deleted_at: null,
      },
    });

    if (!insumo) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const alreadyExists = await this.prisma.ficha_tecnica.findFirst({
      where: {
        produto_id: produtoId,
        insumo_id: dto.insumo_id,
        deleted_at: null,
      },
    });

    if (alreadyExists) {
      throw new BadRequestException('Este insumo já existe na ficha técnica');
    }

    return this.prisma.ficha_tecnica.create({
      data: {
        produto_id: produtoId,
        insumo_id: dto.insumo_id,
        quantidade: dto.quantidade,
      },
      include: {
        produtos_ficha_tecnica_insumo_idToprodutos: {
          select: {
            id: true,
            nome: true,
            unidade_medida: true,
          },
        },
      },
    });
  }

  async findFichaTecnica(produtoId: string, restauranteId: string) {
    await this.findOne(produtoId, restauranteId);

    return this.prisma.ficha_tecnica.findMany({
      where: {
        produto_id: produtoId,
        deleted_at: null,
      },
      include: {
        produtos_ficha_tecnica_insumo_idToprodutos: {
          select: {
            id: true,
            nome: true,
            quantidade: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async removeFichaTecnica(fichaTecnicaId: string, restauranteId: string) {
    const ficha = await this.prisma.ficha_tecnica.findFirst({
      where: {
        id: fichaTecnicaId,
        deleted_at: null,
        produtos_ficha_tecnica_produto_idToprodutos: {
          restaurante_id: restauranteId,
        },
      },
    });

    if (!ficha) {
      throw new NotFoundException('Item da ficha técnica não encontrado');
    }

    await this.prisma.ficha_tecnica.update({
      where: {
        id: fichaTecnicaId,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Item removido da ficha técnica',
    };
  }
}
