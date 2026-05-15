import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // o Helmet é um middleware de segurança para Express que ajuda a proteger a aplicação contra algumas
  // vulnerabilidades comuns, como ataques de clickjacking, XSS e injeção de código.
  // Ele configura vários cabeçalhos HTTP para melhorar a segurança da aplicação.
  // O uso do Helmet é recomendado para qualquer aplicação web, incluindo APIs, para reduzir a superfície de ataque e proteger os dados dos usuários.
  // app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // habilita o cors para permitir requisições do frontend
  // provisório, depois vou configurar para aceitar só do domínio do frontend
  app.enableCors({
    origin: '*',
  });

  // configura um prefixo global para todas as rotas da API
  // app.setGlobalPrefix('api');

  // configurando o swagger para gerar a documentação da API
  const config = new DocumentBuilder()
    .setTitle('Fluxa API')
    .setDescription('Sistema de gestão para restaurantes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, '0.0.0.0');
}
void bootstrap();
