const express = require("express");
const { body } = require("express-validator");
const { usersServices } = require("../services");
const {
  checkValidObjectId,
  checkRolesAuthorization,
} = require("../middlewares");
const { usersRules } = require("./rules");
const { User } = require("../models");

const userRoutes = express.Router();

userRoutes.get("/", usersServices.getUsers);
userRoutes.get(
  "/:userId",
  checkValidObjectId("userId", User),
  usersServices.getUser
);
userRoutes.patch(
  "/:userId",
  checkValidObjectId("userId", User),
  checkRolesAuthorization("users.update", User, "userId"),
  usersRules.patchUserRules(body),
  usersServices.patchUser
);
userRoutes.delete(
  "/:userId",
  checkValidObjectId("userId", User),
  checkRolesAuthorization("users.update", User, "userId"),
  usersServices.deleteUser
);
userRoutes.post(
  "/registration",
  checkRolesAuthorization("users.create"),
  usersRules.postUserRules(body),
  usersServices.registerUser
);
userRoutes.post(
  "/authentication",
  usersRules.getUserAuthenticationRules(body),
  usersServices.authenticateUser
);
userRoutes.post("/request-reset-password", usersServices.requestResetPassword);
userRoutes.post("/reset-password", usersServices.resetPassword);
userRoutes.post("/verify-email-account", usersServices.verifyEmailAccount);

//RELATIONSHIPS
// ***** Self

// ***** Related
userRoutes.get(
  "/:userId/products",
  checkValidObjectId("userId", User),
  usersServices.getProductsByUser
);

module.exports = userRoutes;
