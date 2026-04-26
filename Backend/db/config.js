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

const createNoopEnsureDatabaseExists = () => async () => {};

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
  ...(url ? {} : { define: { freezeTableName: false } }),
});

const getPostgresConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const host = process.env.POSTGRES_HOST || process.env.PGHOST;
  const port = process.env.POSTGRES_PORT || process.env.PGPORT || 5432;
  const database = process.env.POSTGRES_DB || process.env.PGDATABASE;
  const username = process.env.POSTGRES_USER || process.env.PGUSER;
  const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD;
  const sslEnabled = parseBoolean(process.env.DB_SSL, false);
  const dialectOptions = sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined;

  if (databaseUrl) {
    return {
      configured: true,
      dialect: "postgres",
      label: "PostgreSQL",
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
      label: "PostgreSQL",
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
  const host = process.env.AWS_RDS_HOST || process.env.MYSQL_HOST;
  const port = process.env.AWS_RDS_PORT || process.env.MYSQL_PORT;
  const database = process.env.AWS_RDS_DB_NAME || process.env.MYSQL_DB;
  const username = process.env.AWS_RDS_USERNAME || process.env.MYSQL_USER;
  const password = process.env.AWS_RDS_PASSWORD || process.env.MYSQL_PASS;

  if (!host || !port || !database || !username || !password) {
    return null;
  }

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
    label: "MySQL",
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
