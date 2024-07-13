import { Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import appConfig from './app.config';

export class MongooseModuleConfig implements MongooseOptionsFactory {
  constructor(
    @Inject(appConfig.KEY)
    private appConfigs: ConfigType<typeof appConfig>,
  ) {}

  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions {
    const { DATABASE_URL, MONGO_INITDB_DATABASE } = this.appConfigs;
    const connectionString =
      DATABASE_URL + '/' + MONGO_INITDB_DATABASE;

    Logger.log(
      `Connected to MongoDB: ${connectionString}`,
      'NestApplication',
    );

    return {
      autoIndex: true,
      autoCreate: true,
      retryDelay: 30,
      retryAttempts: 10,
      uri: DATABASE_URL,
      dbName: MONGO_INITDB_DATABASE,
    };
  }
}
