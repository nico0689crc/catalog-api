const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const i18next = require("i18next");
const cors = require("cors");
const i18nextBackend = require("i18next-fs-backend");
const i18nextMiddleware = require("i18next-http-middleware");
const {
  userRoutes,
  tagRoutes,
  commentRoutes,
  productRoutes,
  categoryRoutes,
} = require("../src/routes");
const { unknownEndpoint, globalErrorHandler } = require("../src/middlewares");

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}/translation.json",
    },
  });

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(
  "/uploads/images/products",
  express.static(path.join("uploads", "images", "products"))
);

app.use(i18nextMiddleware.handle(i18next));

app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.use(unknownEndpoint);

app.use(globalErrorHandler);

module.exports = app;
