import { NodeEnv } from '@shared';

export interface AppConfig {
  NODE_ENV: NodeEnv;
  DATABASE_URL: string;
  MONGO_INITDB_DATABASE: string;
  SWAGGER_PATH: string;
}
