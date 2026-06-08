/*
  Warnings:

  - Added the required column `unidade_medida` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estoque_movimentacoes" ADD COLUMN     "referencia_tipo" "referencia_tipo";

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "controla_estoque" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unidade_medida" "unidade_produto" NOT NULL;
