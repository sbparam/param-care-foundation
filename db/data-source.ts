require('dotenv').config();
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || '',
  // port: parseInt(process.env.DB_PORT) || 3306,
  port: 3306,
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: process.env.NODE_ENV !== 'production' ? true : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
