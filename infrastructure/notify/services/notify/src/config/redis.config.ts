import { RedisOptions } from 'ioredis';
import { config } from './env.config';

export const redisOptions: RedisOptions = {
  host: config.redisHost,
  port: config.redisPort
};
