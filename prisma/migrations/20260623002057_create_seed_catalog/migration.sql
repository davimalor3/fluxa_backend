-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "catalogo_produto_id" UUID,
ADD COLUMN     "categoria_id" UUID,
ADD COLUMN     "estoque_minimo" DECIMAL(10,3);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_produtos" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "tipo" "produto_tipo" NOT NULL,
    "unidade_medida" "unidade_produto" NOT NULL,
    "categoria_id" UUID NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagem_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalogo_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "catalogo_produtos_nome_idx" ON "catalogo_produtos"("nome");

-- CreateIndex
CREATE INDEX "catalogo_produtos_categoria_id_idx" ON "catalogo_produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_idx" ON "produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "produtos_tipo_idx" ON "produtos"("tipo");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_catalogo_produto_id_fkey" FOREIGN KEY ("catalogo_produto_id") REFERENCES "catalogo_produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo_produtos" ADD CONSTRAINT "catalogo_produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
