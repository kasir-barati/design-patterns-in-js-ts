import { Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import appConfig from './app.config';

export class MongooseModuleConfig implements MongooseOptionsFactory {
  constructor(
    @Inject(appConfig.KEY)
    private appConfigs: ConfigType<typeof appConfig>,
  ) {}

  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions {
    const collectionName = 'posts';
    const { DATABASE_URL, MONGODB_DATABASE } = this.appConfigs;
    const connectionString = DATABASE_URL + '/' + MONGODB_DATABASE;

    return {
      autoIndex: true,
      autoCreate: true,
      retryDelay: 30,
      retryAttempts: 10,
      uri: DATABASE_URL,
      dbName: MONGODB_DATABASE,
      async connectionFactory(connection: Connection) {
        const isDatabasePartitioned = await isDatabaseSharded(
          connection,
          MONGODB_DATABASE,
        );
        const isCollectionPartitioned = await isCollectionSharded(
          connection,
          MONGODB_DATABASE,
          collectionName,
        );

        if (!isDatabasePartitioned) {
          // TODO: Upgrade to latest possible version of MongoDB.
          // Starting in MongoDB 6.0, this command is not required to shard a collection.
          await connection.db.admin().command({
            enableSharding: MONGODB_DATABASE,
          });
        }

        if (!isCollectionPartitioned) {
          // The shardCollection command must be run against the admin database.
          await connection.db.admin().command({
            shardCollection: `${MONGODB_DATABASE}.${collectionName}`,
            key: { handle: 1 },
          });
        }

        connection.on('connected', () => {
          Logger.log(
            `Connected to MongoDB: ${connectionString}`,
            'NestApplication',
          );
          Logger.log(
            `MongoDB Compass connection string: ${DATABASE_URL}`,
            'NestApplication',
          );
        });
        connection['_events'].connected();

        return connection;
      },
    };
  }
}

async function isDatabaseSharded(
  connection: Connection,
  db: string,
): Promise<boolean> {
  const result = await connection
    .useDb('config')
    .collection('databases')
    .findOne({ _id: db as any });

  return result.partitioned;
}

async function isCollectionSharded(
  connection: Connection,
  db: string,
  collection: string,
): Promise<boolean> {
  const result = await connection
    .useDb('config')
    .collection('collections')
    .findOne({ _id: `${db}.${collection}` as any });

  return result !== null;
}
