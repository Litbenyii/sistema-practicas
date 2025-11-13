require("dotenv").config();

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
};

module.exports = { config };
