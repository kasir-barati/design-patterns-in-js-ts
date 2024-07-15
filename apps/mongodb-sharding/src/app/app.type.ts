import { NodeEnv } from '@shared';

export interface AppConfig {
  NODE_ENV: NodeEnv;
  APP_PORT: number;
  DATABASE_URL: string;
  MONGODB_DATABASE: string;
  SWAGGER_PATH: string;
}
