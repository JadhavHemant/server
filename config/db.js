const { Pool } = require('pg');
require('dotenv').config();

const {
  NODE_ENV,
  LOCAL_DB_NAME,
  LOCAL_DB_USER,
  LOCAL_DB_PASSWORD,
  LOCAL_DB_HOST,
  REMOTE_DB_NAME,
  REMOTE_DB_USER,
  REMOTE_DB_PASSWORD,
  REMOTE_DB_HOST,
  DATABASE_URL
} = process.env;

const isProd = NODE_ENV === 'production';

const dbConfig = {
  user: isProd ? REMOTE_DB_USER : LOCAL_DB_USER,
  host: isProd ? REMOTE_DB_HOST : LOCAL_DB_HOST,
  password: isProd ? REMOTE_DB_PASSWORD : LOCAL_DB_PASSWORD,
  database: isProd ? REMOTE_DB_NAME : LOCAL_DB_NAME,
  ssl: isProd ? { rejectUnauthorized: false } : false,
};

const appPool = new Pool(dbConfig);

let pool = null;
const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
    });
  }
  return pool;
};

const ensureDatabaseExists = async () => {
  if (isProd) return;

  const defaultPool = new Pool({
    user: LOCAL_DB_USER,
    host: LOCAL_DB_HOST,
    password: LOCAL_DB_PASSWORD,
    database: 'postgres',
  });

  const checkQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
  const createQuery = `CREATE DATABASE "${LOCAL_DB_NAME}"`;

  try {
    const result = await defaultPool.query(checkQuery, [LOCAL_DB_NAME]);
    if (result.rowCount === 0) {
      await defaultPool.query(createQuery);
      console.log(`✅ Database '${LOCAL_DB_NAME}' created.`);
    } else {
      console.log(`ℹ️ Database '${LOCAL_DB_NAME}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Error checking/creating database:', err);
  } finally {
    await defaultPool.end();
  }
};

module.exports = {
  appPool,
  ensureDatabaseExists,
  getPool,
};
