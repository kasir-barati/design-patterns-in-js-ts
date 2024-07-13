import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './configs/app.config';
import corsConfig from './configs/cors.config';
import { MongooseModuleConfig } from './configs/mongoose.config';
import { Post, PostSchema } from './post.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), '.env'),
      load: [appConfig, corsConfig],
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      useClass: MongooseModuleConfig,
    }),
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
