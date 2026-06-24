import { CatalogSeedItem } from 'src/catalog/types/catalog-seed-item';

export const insumos: CatalogSeedItem = {
  categoria: 'Insumos',
  produtos: [
    // Farinhas
    { nome: 'Farinha de Trigo', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Farinha Integral', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Farinha de Rosca', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Amido de Milho', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Óleos e Gorduras
    { nome: 'Óleo de Soja', tipo: 'INSUMO', unidade_medida: 'L' },
    { nome: 'Óleo de Girassol', tipo: 'INSUMO', unidade_medida: 'L' },
    { nome: 'Azeite de Oliva', tipo: 'INSUMO', unidade_medida: 'L' },
    { nome: 'Margarina', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Manteiga', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Temperos Básicos
    { nome: 'Sal Refinado', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Sal Grosso', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Açúcar Cristal', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Açúcar Refinado', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Pimenta-do-Reino', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Orégano', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Colorau', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Páprica Doce', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Páprica Picante', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Cominho', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Alho Triturado', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Cebola Desidratada', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Molhos
    { nome: 'Molho de Tomate', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Extrato de Tomate', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Ketchup', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Mostarda', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Maionese', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Molho Barbecue', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Molho Shoyu', tipo: 'INSUMO', unidade_medida: 'L' },

    // Laticínios
    { nome: 'Leite Integral', tipo: 'INSUMO', unidade_medida: 'L' },
    { nome: 'Creme de Leite', tipo: 'INSUMO', unidade_medida: 'L' },
    { nome: 'Requeijão', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Cream Cheese', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Queijo Mussarela', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Queijo Prato', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Queijo Cheddar', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Queijo Parmesão', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Catupiry', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Carnes
    { nome: 'Carne Bovina', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Carne Moída', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Peito de Frango', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Frango Desfiado', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Bacon', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Calabresa', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Presunto', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Linguiça Toscana', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Costela Bovina', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Hortifruti
    { nome: 'Tomate', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Cebola', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Alho', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Alface', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Rúcula', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Milho Verde', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Ervilha', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Batata Inglesa', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Batata Palito Congelada', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Azeitona Verde', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Champignon', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Pimentão Verde', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Pimentão Vermelho', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Pizzaria
    { nome: 'Massa de Pizza', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Borda Recheada', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Molho para Pizza', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Hamburgueria
    { nome: 'Pão de Hambúrguer', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Hambúrguer Bovino 120g', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Hambúrguer Bovino 180g', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Pão Brioche', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Picles', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Padaria e Confeitaria
    { nome: 'Fermento Biológico', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Fermento Químico', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Chocolate em Pó', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Leite Condensado', tipo: 'INSUMO', unidade_medida: 'KG' },
    { nome: 'Granulado', tipo: 'INSUMO', unidade_medida: 'KG' },

    // Ovos
    { nome: 'Ovo de Galinha', tipo: 'INSUMO', unidade_medida: 'UN' },

    // Embalagens
    { nome: 'Embalagem Marmitex P', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Embalagem Marmitex M', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Embalagem Marmitex G', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Copo Descartável 200ml', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Copo Descartável 300ml', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Tampa para Copo', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Guardanapo', tipo: 'INSUMO', unidade_medida: 'UN' },
    { nome: 'Saco Delivery', tipo: 'INSUMO', unidade_medida: 'UN' },
  ],
};
