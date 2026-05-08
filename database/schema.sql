CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criação da tabela de restaurantes
CREATE TABLE restaurantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de usuários
CREATE TYPE user_role AS ENUM ('GERENTE', 'GARCOM');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role user_role NOT NULL,
    restaurante_id UUID NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- Criação da tabela de mesas
CREATE TABLE mesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INT NOT NULL,
    restaurante_id UUID NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (numero, restaurante_id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- Criação da tabela de pedidos
CREATE TYPE comanda_status AS ENUM ('ABERTA', 'AGUARDANDO_FECHAMENTO', 'FECHADA');

CREATE TABLE comandas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesa_id UUID NOT NULL,
    restaurante_id UUID NOT NULL,
    status comanda_status DEFAULT 'ABERTA',
    total DECIMAL(10,2) DEFAULT 0,
    aberta_por UUID,
    fechada_por UUID,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (aberta_por) REFERENCES usuarios(id),
    FOREIGN KEY (fechada_por) REFERENCES usuarios(id)
);


-- Criação da tabela de produtos
CREATE TYPE produto_tipo AS ENUM ('PRODUTO', 'INSUMO');

CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2),
    quantidade DECIMAL(10,3) DEFAULT 0,
    tipo produto_tipo NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    restaurante_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- Criação da tabela de itens da comanda
CREATE TABLE itens_comanda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comanda_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);


-- Criação da tabela de ficha técnica
CREATE TABLE ficha_tecnica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    insumo_id UUID NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (insumo_id) REFERENCES produtos(id)
);


-- Criação da tabela de movimentações de estoque 
CREATE TYPE movimento_tipo AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

CREATE TABLE estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    restaurante_id UUID NOT NULL,
    tipo movimento_tipo NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    motivo VARCHAR(255),
    referencia_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- Criação da tabela de inventários
CREATE TABLE inventarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    restaurante_id UUID NOT NULL,
    quantidade_real DECIMAL(10,3) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- Criação da tabela de pagamentos
CREATE TYPE forma_pagamento AS ENUM ('PIX', 'CARTAO', 'DINHEIRO');

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comanda_id UUID NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento forma_pagamento NOT NULL,
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comanda_id) REFERENCES comandas(id)
);


-- Criação da tabela de solicitações de fechamento
CREATE TYPE solicitacao_status AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

CREATE TABLE solicitacoes_fechamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comanda_id UUID NOT NULL,
    solicitado_por UUID NOT NULL,
    status solicitacao_status DEFAULT 'PENDENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (solicitado_por) REFERENCES usuarios(id)
);



-- Índices para otimizar consultas
CREATE INDEX idx_mesa_restaurante ON mesas(restaurante_id);
CREATE INDEX idx_comanda_mesa ON comandas(mesa_id);
CREATE INDEX idx_produto_nome ON produtos(nome);
CREATE INDEX idx_inventario_produto ON inventarios(produto_id);
CREATE INDEX idx_pagamento_comanda ON pagamentos(comanda_id);
CREATE INDEX idx_solicitacao_comanda ON solicitacoes_fechamento(comanda_id);
CREATE INDEX idx_ficha_tecnica_produto ON ficha_tecnica(produto_id);
CREATE INDEX idx_ficha_tecnica_insumo ON ficha_tecnica(insumo_id);
CREATE INDEX idx_estoque_movimentacao_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX idx_estoque_movimentacao_restaurante ON estoque_movimentacoes(restaurante_id);

CREATE INDEX idx_usuario_restaurante ON usuarios(restaurante_id);
CREATE INDEX idx_produto_restaurante ON produtos(restaurante_id);
CREATE INDEX idx_comanda_restaurante ON comandas(restaurante_id);
CREATE INDEX idx_comanda_status ON comandas(status);
CREATE INDEX idx_itens_comanda ON itens_comanda(comanda_id);