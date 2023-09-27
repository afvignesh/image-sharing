import { Pool } from 'pg';

require('dotenv').config();

export const dbConfig = {
  user: process.env.DB_USERNAME,
  host: 'db',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
};

export const pool = new Pool(dbConfig);

