import { CatalogSeedItem } from 'src/catalog/types/catalog-seed-item';

export const temperos: CatalogSeedItem = {
  categoria: 'Temperos',
  produtos: [
    {
      nome: 'Farinha de Trigo',
      tipo: 'INSUMO',
      unidade_medida: 'KG',
    },
    {
      nome: 'Óleo de Soja',
      tipo: 'INSUMO',
      unidade_medida: 'L',
    },
    {
      nome: 'Sal Refinado',
      tipo: 'INSUMO',
      unidade_medida: 'KG',
    },
  ],
};
