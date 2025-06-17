import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5435', 10),
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: true,
  logging: true,
});

export default AppDataSource;
