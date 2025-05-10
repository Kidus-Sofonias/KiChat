const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    user: process.env.AWS_RDS_USERNAME,
    password: process.env.AWS_RDS_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.AWS_RDS_DB_NAME}\`;`
  );
  await connection.end();
}

(async () => {
  try {
    await ensureDatabaseExists();
    console.log("✅ Database ensured to exist");
  } catch (err) {
    console.error("❌ Error ensuring database existence:", err.message);
  }
})();

const sequelize = new Sequelize(
  process.env.AWS_RDS_DB_NAME,
  process.env.AWS_RDS_USERNAME,
  process.env.AWS_RDS_PASSWORD,
  {
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

module.exports = sequelize;
