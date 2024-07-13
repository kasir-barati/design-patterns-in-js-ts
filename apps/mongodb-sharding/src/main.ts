import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app/app.module';
import appConfig from './app/configs/app.config';
import corsConfig from './app/configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { SWAGGER_PATH, APP_PORT } = app.get<
    ConfigType<typeof appConfig>
  >(appConfig.KEY);
  const cors = app.get<ConfigType<typeof corsConfig>>(corsConfig.KEY);
  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('Database Sharding')
    .setDescription('A RESTful API with a sharded MongoDB.')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    documentBuilderConfig,
  );

  app.use(json({ limit: '20mb' }));
  app.enableCors(cors);
  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  await app.listen(APP_PORT);

  Logger.log(
    `🚀 Application is running on: http://localhost:${APP_PORT}`,
    'NestApplication',
  );
  Logger.log(
    `🚀 Swagger GUI is running on: http://localhost:${APP_PORT}/${SWAGGER_PATH}`,
    'NestApplication',
  );
}

bootstrap();
