const mongoose = require("mongoose");
require("dotenv").config();

const config = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  clusterName: process.env.DB_CLUSTER_NAME,
  database: process.env.DB_DATABASE_NAME,
  databaseTesting: process.env.DB_DATABASE_NAME_TEST,
};

const getStringConnection = testing => {
  const databaseName = testing ? config.databaseTesting : config.database;

  const string = `mongodb://${config.username}:${config.password}@${config.clusterName}:27017/${databaseName}?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&directConnection=true&ssl=false`;
  return string;
};

const connect = (callback, testing = false) => {
  mongoose
    .connect(getStringConnection(testing))
    .then(callback())
    .catch(error => {
      console.log("Error DB Connection ====>>> " + error.message);
    });
};

const disconnect = () => {
  mongoose.connection.close().catch(() => {
    console.log("Error DB Disconnection ====>>> " + error.message);
  });
};

const databaseConfig = {
  connect,
  disconnect,
};

module.exports = databaseConfig;
