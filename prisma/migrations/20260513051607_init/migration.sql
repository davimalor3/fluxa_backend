-- CreateEnum
CREATE TYPE "comanda_status" AS ENUM ('ABERTA', 'AGUARDANDO_FECHAMENTO', 'FECHADA');

-- CreateEnum
CREATE TYPE "mesa_status" AS ENUM ('DISPONIVEL', 'OCUPADA', 'RESERVADA', 'INATIVA');

-- CreateEnum
CREATE TYPE "forma_pagamento" AS ENUM ('PIX', 'CARTAO', 'DINHEIRO');

-- CreateEnum
CREATE TYPE "movimento_tipo" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "produto_tipo" AS ENUM ('PRODUTO', 'INSUMO');

-- CreateEnum
CREATE TYPE "solicitacao_status" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('GERENTE', 'GARCOM');

-- CreateTable
CREATE TABLE "comandas" (
    "id" UUID NOT NULL,
    "mesa_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "status" "comanda_status" NOT NULL DEFAULT 'ABERTA',
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "observacao" VARCHAR(255),
    "aberta_por" UUID,
    "fechada_por" UUID,
    "data_abertura" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque_movimentacoes" (
    "id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "tipo" "movimento_tipo" NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "motivo" VARCHAR(255),
    "referencia_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estoque_movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_tecnica" (
    "id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "ficha_tecnica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventarios" (
    "id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "quantidade_real" DECIMAL(10,3) NOT NULL,
    "data" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_comanda" (
    "id" UUID NOT NULL,
    "comanda_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "itens_comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "status" "mesa_status" NOT NULL DEFAULT 'DISPONIVEL',
    "observacao" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" UUID NOT NULL,
    "comanda_id" UUID NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "forma_pagamento" NOT NULL,
    "data_pagamento" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2),
    "quantidade" DECIMAL(10,3) DEFAULT 0,
    "tipo" "produto_tipo" NOT NULL,
    "ativo" BOOLEAN DEFAULT true,
    "restaurante_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantes" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(20),
    "endereco" TEXT,
    "telefone" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_fechamento" (
    "id" UUID NOT NULL,
    "comanda_id" UUID NOT NULL,
    "solicitado_por" UUID NOT NULL,
    "status" "solicitacao_status" DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_fechamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "ativo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_comanda_mesa" ON "comandas"("mesa_id");

-- CreateIndex
CREATE INDEX "idx_comanda_restaurante" ON "comandas"("restaurante_id");

-- CreateIndex
CREATE INDEX "idx_comanda_status" ON "comandas"("status");

-- CreateIndex
CREATE INDEX "idx_estoque_movimentacao_produto" ON "estoque_movimentacoes"("produto_id");

-- CreateIndex
CREATE INDEX "idx_estoque_movimentacao_restaurante" ON "estoque_movimentacoes"("restaurante_id");

-- CreateIndex
CREATE INDEX "idx_ficha_tecnica_insumo" ON "ficha_tecnica"("insumo_id");

-- CreateIndex
CREATE INDEX "idx_ficha_tecnica_produto" ON "ficha_tecnica"("produto_id");

-- CreateIndex
CREATE INDEX "idx_inventario_produto" ON "inventarios"("produto_id");

-- CreateIndex
CREATE INDEX "idx_itens_comanda" ON "itens_comanda"("comanda_id");

-- CreateIndex
CREATE INDEX "idx_mesa_restaurante" ON "mesas"("restaurante_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_restaurante_id_key" ON "mesas"("numero", "restaurante_id");

-- CreateIndex
CREATE INDEX "idx_pagamento_comanda" ON "pagamentos"("comanda_id");

-- CreateIndex
CREATE INDEX "idx_produto_nome" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "idx_produto_restaurante" ON "produtos"("restaurante_id");

-- CreateIndex
CREATE INDEX "idx_solicitacao_comanda" ON "solicitacoes_fechamento"("comanda_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_restaurante" ON "usuarios"("restaurante_id");

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_aberta_por_fkey" FOREIGN KEY ("aberta_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_fechada_por_fkey" FOREIGN KEY ("fechada_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estoque_movimentacoes" ADD CONSTRAINT "estoque_movimentacoes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estoque_movimentacoes" ADD CONSTRAINT "estoque_movimentacoes_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ficha_tecnica" ADD CONSTRAINT "ficha_tecnica_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ficha_tecnica" ADD CONSTRAINT "ficha_tecnica_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itens_comanda" ADD CONSTRAINT "itens_comanda_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itens_comanda" ADD CONSTRAINT "itens_comanda_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitacoes_fechamento" ADD CONSTRAINT "solicitacoes_fechamento_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitacoes_fechamento" ADD CONSTRAINT "solicitacoes_fechamento_solicitado_por_fkey" FOREIGN KEY ("solicitado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
