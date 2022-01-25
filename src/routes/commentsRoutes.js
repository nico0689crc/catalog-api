const express = require("express");
const { body } = require("express-validator");
const { commentsServices } = require("../services");
const {
  checkValidObjectId,
  checkRolesAuthorization,
} = require("../middlewares");
const { commentsRules } = require("./rules");
const { Comment } = require("../models");

const commentRoutes = express.Router();

commentRoutes.get("/", commentsServices.getComments);
commentRoutes.get(
  "/:commentId",
  checkValidObjectId("commentId", Comment),
  commentsServices.getComment
);
commentRoutes.post(
  "/",
  checkRolesAuthorization("comments.create"),
  commentsRules.postCommentRules(body),
  commentsServices.postComment
);
commentRoutes.patch(
  "/:commentId",
  checkValidObjectId("commentId", Comment),
  checkRolesAuthorization("comments.update", Comment, "commentId"),
  commentsRules.patchCommentRules(body),
  commentsServices.patchComment
);
commentRoutes.delete(
  "/:commentId",
  checkValidObjectId("commentId", Comment),
  checkRolesAuthorization("comments.delete", Comment, "commentId"),
  commentsServices.deleteComment
);

//RELATIONSHIPS
// ***** Self

// ***** Related

commentRoutes.get(
  "/:commentId/products",
  checkValidObjectId("commentId", Comment),
  commentsServices.getProductByComment
);

commentRoutes.get(
  "/:commentId/creators",
  checkValidObjectId("commentId", Comment),
  commentsServices.getCreatorByComment
);

module.exports = commentRoutes;
