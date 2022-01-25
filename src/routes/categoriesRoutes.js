const express = require("express");
const { body } = require("express-validator");
const { categoriesServices } = require("../services");
const {
  checkRolesAuthorization,
  checkValidObjectId,
} = require("../middlewares");
const { categoriesRules } = require("./rules");
const { Category } = require("../models");

const categoryRoutes = express.Router();

categoryRoutes.get("/", categoriesServices.getCategories);
categoryRoutes.get(
  "/:categoryId",
  checkValidObjectId("categoryId", Category),
  categoriesServices.getCategory
);
categoryRoutes.post(
  "/",
  checkRolesAuthorization("categories.create"),
  categoriesRules.postCategoryRules(body),
  categoriesServices.postCategory
);
categoryRoutes.patch(
  "/:categoryId",
  checkValidObjectId("categoryId", Category),
  checkRolesAuthorization("categories.update", Category, "categoryId"),
  categoriesRules.patchCategoryRules(body),
  categoriesServices.patchCategory
);
categoryRoutes.delete(
  "/:categoryId",
  checkValidObjectId("categoryId", Category),
  checkRolesAuthorization("categories.delete", Category, "categoryId"),
  categoriesServices.deleteCategory
);

//RELATIONSHIPS
// ***** Self

// ***** Related

categoryRoutes.get(
  "/:categoryId/products",
  checkValidObjectId("categoryId", Category),
  categoriesServices.getProductsByCategory
);

categoryRoutes.get(
  "/:categoryId/creators",
  checkValidObjectId("categoryId", Category),
  categoriesServices.getCreatorByCategory
);
module.exports = categoryRoutes;
