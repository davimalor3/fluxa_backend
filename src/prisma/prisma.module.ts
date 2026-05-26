// Este módulo é responsável por fornecer o serviço Prisma para toda a aplicação NestJS. Ele é marcado como global para que o PrismaService possa ser injetado em qualquer lugar da aplicação sem a necessidade de importar o módulo explicitamente em cada módulo que precisa do serviço. O PrismaModule importa o PrismaService e o torna disponível para injeção em outros serviços ou controladores. Ao usar o PrismaService, os desenvolvedores podem interagir com o banco de dados usando os métodos fornecidos pelo PrismaClient, como criar, ler, atualizar e excluir registros no banco de dados.
// O PrismaModule é decorado com @Global(), o que significa que ele será registrado como um módulo global no NestJS. Isso permite que o PrismaService seja injetado em qualquer parte da aplicação sem a necessidade de importar o PrismaModule em cada módulo que precisa do serviço. O PrismaService é fornecido como um provedor no módulo, e também é exportado para que possa ser usado em outros módulos da aplicação.

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// O PrismaModule é um módulo global que fornece o PrismaService para toda a aplicação NestJS. Ele é decorado com @Global() para que o PrismaService possa ser injetado em qualquer lugar da aplicação sem a necessidade de importar o módulo explicitamente em cada módulo que precisa do serviço. O PrismaService é fornecido como um provedor no módulo, e também é exportado para que possa ser usado em outros módulos da aplicação.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
