const app = require("./src/app");
const { databaseConfig, globalConfig } = require("./src/config");
const {
  createResourcesProductTestInit,
} = require("./__tests__/CreateResources");

databaseConfig.connect(() => {
  app.listen(globalConfig.port, async () => {
    // await createResourcesProductTestInit(true, false);
    console.log("Server running on port: " + globalConfig.port);
  });
});
