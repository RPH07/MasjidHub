const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Setup koneksi
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql',
    logging: true, 
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+07:00'
  }
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to Database (Sequelize) has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

checkConnection();

module.exports = sequelize;