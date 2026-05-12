import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
void bootstrap();
