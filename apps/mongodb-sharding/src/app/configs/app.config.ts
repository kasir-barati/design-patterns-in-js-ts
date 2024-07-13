import { registerAs } from '@nestjs/config';
import { NodeEnv, validateEnv } from '@shared';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AppConfig } from '../app.type';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppConfig {}
  }
}

export default registerAs('appConfig', (): AppConfig => {
  const env: AppConfig = process.env;
  const validatedEnv = validateEnv(env, EnvironmentVariables);

  return validatedEnv;
});

class EnvironmentVariables implements AppConfig {
  @IsInt()
  @Min(0)
  @IsOptional()
  APP_PORT: number = 3000;

  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.development;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  MONGO_INITDB_DATABASE: string;

  @IsString()
  @IsOptional()
  SWAGGER_PATH: string = 'docs';
}
