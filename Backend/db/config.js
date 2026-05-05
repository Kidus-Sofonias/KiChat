const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const truthyValues = new Set(["1", "true", "yes", "on", "require"]);

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return truthyValues.has(String(value).trim().toLowerCase());
};
const parseNumber = (value, fallback) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const createNoopEnsureDatabaseExists = () => async () => {};
const getFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const buildSequelizeOptions = ({
  host,
  port,
  dialect,
  dialectOptions,
  url,
}) => ({
  host,
  port,
  dialect,
  dialectOptions,
  logging: false,
  pool: {
    acquire: parseNumber(process.env.DB_POOL_ACQUIRE_MS, 30000),
    idle: parseNumber(process.env.DB_POOL_IDLE_MS, 10000),
  },
  ...(url ? {} : { define: { freezeTableName: false } }),
});

const getPostgresConfig = () => {
  const databaseUrl = getFirstDefined(
    process.env.DATABASE_URL,
    process.env.SUPABASE_DATABASE_URL,
    process.env.SUPABASE_DB_URL
  );
  const host = getFirstDefined(
    process.env.SUPABASE_DB_HOST,
    process.env.POSTGRES_HOST,
    process.env.PGHOST
  );
  const port = getFirstDefined(
    process.env.SUPABASE_DB_PORT,
    process.env.POSTGRES_PORT,
    process.env.PGPORT,
    5432
  );
  const database = getFirstDefined(
    process.env.SUPABASE_DB_NAME,
    process.env.POSTGRES_DB,
    process.env.PGDATABASE
  );
  const username = getFirstDefined(
    process.env.SUPABASE_DB_USER,
    process.env.POSTGRES_USER,
    process.env.PGUSER
  );
  const password = getFirstDefined(
    process.env.SUPABASE_DB_PASSWORD,
    process.env.POSTGRES_PASSWORD,
    process.env.PGPASSWORD
  );
  const isSupabaseConfig = Boolean(
    process.env.SUPABASE_DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.SUPABASE_DB_HOST
  );
  const sslEnabled = parseBoolean(
    process.env.DB_SSL,
    Boolean(databaseUrl) || isSupabaseConfig
  );
  const connectionTimeoutMillis = parseNumber(
    process.env.DB_CONNECT_TIMEOUT_MS,
    30000
  );
  const dialectOptions = sslEnabled
    ? {
        connectionTimeoutMillis,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {
        connectionTimeoutMillis,
      };

  if (databaseUrl) {
    return {
      configured: true,
      dialect: "postgres",
      label: isSupabaseConfig ? "Supabase Postgres" : "PostgreSQL",
      sequelize: new Sequelize(
        databaseUrl,
        buildSequelizeOptions({
          dialect: "postgres",
          dialectOptions,
          url: databaseUrl,
        })
      ),
      ensureDatabaseExists: createNoopEnsureDatabaseExists(),
    };
  }

  if (host && database && username && password) {
    return {
      configured: true,
      dialect: "postgres",
      label: isSupabaseConfig ? "Supabase Postgres" : "PostgreSQL",
      sequelize: new Sequelize(
        database,
        username,
        password,
        buildSequelizeOptions({
          host,
          port,
          dialect: "postgres",
          dialectOptions,
        })
      ),
      ensureDatabaseExists: createNoopEnsureDatabaseExists(),
    };
  }

  return null;
};

const getLegacyMysqlConfig = () => {
  const candidates = [
    {
      label: "MySQL",
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DB,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
    },
    {
      label: "AWS RDS MySQL",
      host: process.env.AWS_RDS_HOST,
      port: process.env.AWS_RDS_PORT,
      database: process.env.AWS_RDS_DB_NAME,
      username: process.env.AWS_RDS_USERNAME,
      password: process.env.AWS_RDS_PASSWORD,
    },
  ];

  const selectedCandidate = candidates.find(
    ({ host, port, database, username, password }) =>
      host && port && database && username && password
  );

  if (!selectedCandidate) {
    return null;
  }

  const { host, port, database, username, password, label } = selectedCandidate;

  const ensureDatabaseExists = async () => {
    const connection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
  };

  return {
    configured: true,
    dialect: "mysql",
    label,
    sequelize: new Sequelize(
      database,
      username,
      password,
      buildSequelizeOptions({
        host,
        port,
        dialect: "mysql",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          connectTimeout: 15000,
        },
      })
    ),
    ensureDatabaseExists,
  };
};

const getFallbackConfig = () => ({
  configured: false,
  dialect: "postgres",
  label: "Local fallback",
  sequelize: new Sequelize("fallback_db", "fallback_user", "fallback_password", {
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres",
    logging: false,
  }),
  ensureDatabaseExists: createNoopEnsureDatabaseExists(),
});

const databaseSetup =
  getPostgresConfig() || getLegacyMysqlConfig() || getFallbackConfig();

const sequelize = databaseSetup.sequelize;
sequelize.ensureDatabaseExists = databaseSetup.ensureDatabaseExists;
sequelize.isConfigured = databaseSetup.configured;
sequelize.databaseDialect = databaseSetup.dialect;
sequelize.databaseLabel = databaseSetup.label;

module.exports = sequelize;
