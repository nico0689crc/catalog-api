const express = require("express");
const { body } = require("express-validator");
const { productsServices } = require("../services");
const {
  checkRolesAuthorization,
  checkValidObjectId,
  fileUploadMulter,
} = require("../middlewares");
const { productsRules } = require("./rules");
const { Product } = require("../models");

const productRoutes = express.Router();

productRoutes.get("/", productsServices.getProducts);
productRoutes.get(
  "/:productId",
  checkValidObjectId("productId", Product),
  productsServices.getProduct
);
productRoutes.post(
  "/",
  checkRolesAuthorization("products.create"),
  fileUploadMulter.fileUploadProducts.array("images", 10),
  productsRules.postProductRules(body),
  productsServices.postProduct
);
productRoutes.patch(
  "/:productId",
  checkValidObjectId("productId", Product),
  checkRolesAuthorization("products.update", Product, "productId"),
  fileUploadMulter.fileUploadProducts.array("images", 10),
  productsRules.patchProductRules(body),
  productsServices.patchProduct
);
productRoutes.delete(
  "/:productId",
  checkValidObjectId("productId", Product),
  checkRolesAuthorization("products.delete", Product, "productId"),
  productsServices.deleteProduct
);

//RELATIONSHIPS
// ***** Self

// ***** Related
productRoutes.get(
  "/:productId/tags",
  checkValidObjectId("productId", Product),
  productsServices.getTagsByProduct
);

productRoutes.get(
  "/:productId/comments",
  checkValidObjectId("productId", Product),
  productsServices.getCommentsByProduct
);

productRoutes.get(
  "/:productId/categories",
  checkValidObjectId("productId", Product),
  productsServices.getCategoryByProduct
);

productRoutes.get(
  "/:productId/creators",
  checkValidObjectId("productId", Product),
  productsServices.getCreatorByProduct
);

module.exports = productRoutes;
