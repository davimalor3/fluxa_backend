import { IsEnum } from 'class-validator';
import { forma_pagamento } from '@prisma/client';

export class CloseOrderDto {
  @IsEnum(forma_pagamento)
  forma_pagamento!: forma_pagamento;
}
