import { produto_tipo, unidade_produto } from '@prisma/client';

export interface CatalogSeedItem {
  categoria: string;
  produtos: {
    nome: string;
    tipo: produto_tipo; // Usa o enum gerado pelo Prisma
    unidade_medida: unidade_produto; // Usa o enum gerado pelo Prisma
  }[];
}
