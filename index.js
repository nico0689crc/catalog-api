const app = require("./src/app");
const { databaseConfig, globalConfig } = require("./src/config");

databaseConfig.connect(() => {
  app.listen(globalConfig.port, async () => {
    console.log("Server running on port: " + globalConfig.port);
  });
});
