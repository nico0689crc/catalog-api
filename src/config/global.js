require("dotenv").config();

const globalConfig = {
  port: process.env.RUNNING_PORT,
  api_url_base: `${process.env.API_URL_BASE}:${process.env.RUNNING_PORT}/api`,
  server_url_base: `${process.env.SERVER_URL_BASE}:${process.env.RUNNING_PORT}`,
  jwt_key: process.env.JWT_KEY,
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME,
  sendgrid_api_key: process.env.SENDGRID_API_KEY,
  sendgrid_email_from: process.env.SENDGRID_EMAIL_FROM,
};

module.exports = globalConfig;
