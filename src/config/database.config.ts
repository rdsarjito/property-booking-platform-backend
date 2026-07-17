import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  name: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USERNAME,
  pass: process.env.POSTGRES_PASSWORD,
}));
