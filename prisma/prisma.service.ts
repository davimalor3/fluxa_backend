// Este arquivo é responsável por configurar o serviço Prisma, que é usado para interagir com o banco de dados. Ele estende a classe PrismaClient e implementa a interface OnModuleInit para garantir que a conexão com o banco de dados seja estabelecida quando o módulo for inicializado.
// O PrismaService é decorado com @Injectable(), o que permite que ele seja injetado em outros serviços ou controladores do NestJS. O método onModuleInit é chamado automaticamente pelo NestJS quando o módulo é inicializado, e dentro dele, a conexão com o banco de dados é estabelecida usando o método $connect() do PrismaClient.
// Ao usar o PrismaService em outros lugares do aplicativo, como no UserService, ele pode ser injetado através do construtor, permitindo que os métodos do PrismaClient sejam usados para realizar operações de banco de dados, como criar ou buscar usuários.

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// O PrismaService é um serviço global que pode ser injetado em qualquer parte do aplicativo NestJS. Ele estende o PrismaClient, que é a classe gerada pelo Prisma para interagir com o banco de dados, e implementa a interface OnModuleInit para garantir que a conexão com o banco de dados seja estabelecida quando o módulo for inicializado.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
