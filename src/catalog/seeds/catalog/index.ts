import { bebidas } from './bebidas.seed';
import { insumos } from './insumos.seed';
import { carnes } from './carnes.seed';
import { sobremesas } from './sobremesas.seed';
import { CatalogSeedItem } from 'src/catalog/types/catalog-seed-item';
import { temperos } from './temperos.seed';
import { conveniencia } from './conveniencia.seed';
import { embalagens_descartaveis } from './embalagens_descartaveis.seed';

export const catalogs: CatalogSeedItem[] = [
  bebidas,
  insumos,
  carnes,
  temperos,
  sobremesas,
  conveniencia,
  embalagens_descartaveis,
];
