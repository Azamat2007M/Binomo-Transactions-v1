const { Sequelize } = require('sequelize');
const { URL } = require('url'); 
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("КРИТИЧЕСКАЯ ОШИБКА: Переменная DATABASE_URL не найдена в файле .env!");
  process.exit(1);
}

const parsedUrl = new URL(connectionString);
const dbHost = parsedUrl.hostname;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      servername: dbHost 
    }
  }
});

module.exports = sequelize;