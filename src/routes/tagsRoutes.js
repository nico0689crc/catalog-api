const express = require("express");
const { body } = require("express-validator");
const { tagsServices } = require("../services");
const {
  checkValidObjectId,
  checkRolesAuthorization,
} = require("../middlewares");
const { tagsRules } = require("./rules");
const { Tag } = require("../models");

const tagRoutes = express.Router();

tagRoutes.get("/", tagsServices.getTags);
tagRoutes.get("/:tagId", checkValidObjectId("tagId", Tag), tagsServices.getTag);
tagRoutes.post(
  "/",
  checkRolesAuthorization("tags.create"),
  tagsRules.postTagRules(body),
  tagsServices.postTag
);
tagRoutes.patch(
  "/:tagId",
  checkValidObjectId("tagId", Tag),
  checkRolesAuthorization("tags.update", Tag, "tagId"),
  tagsRules.patchTagRules(body),
  tagsServices.patchTag
);
tagRoutes.delete(
  "/:tagId",
  checkValidObjectId("tagId", Tag),
  checkRolesAuthorization("tags.delete", Tag, "tagId"),
  tagsServices.deleteTag
);

//RELATIONSHIPS
// ***** Self

// ***** Related
tagRoutes.get(
  "/:tagId/products",
  checkValidObjectId("tagId", Tag),
  tagsServices.getProductsByTag
);

tagRoutes.get(
  "/:tagId/creators",
  checkValidObjectId("tagId", Tag),
  tagsServices.getCreatorByTag
);

module.exports = tagRoutes;
