const jwt = require("jsonwebtoken");
const { globalConfig } = require("../config");
const { ErrorResponseParser, ResponsesTypes } = require("../shared");
const { User } = require("../models");

const stopRequest = (next, req) => {
  const errorsObjects = [
    {
      source: {
        pointer: req.originalUrl,
      },
      title: req.t("middleware.check_valid_token.not_authorization.title"),
      detail: req.t("middleware.check_valid_token.not_authorization.detail"),
    },
  ];

  return next(
    new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_token_without_authorization,
      errorsObjects
    )
  );
};

const stopRequestNotFound = (next, req) => {
  const errorsObjects = [
    {
      source: {
        pointer: req.originalUrl,
      },
      title: req.t("middleware.resource_not_found.title"),
      detail: req.t("middleware.resource_not_found.detail"),
    },
  ];

  return next(
    new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_resource_not_found,
      errorsObjects
    )
  );
};

const checkValidToken = async (req, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return;
  }

  const token = authorizationHeader.split(" ")[1];

  const tokenDecodedPayload = await jwt.verify(
    token,
    globalConfig.jwt_key,
    function (error, decoded) {
      if (error) {
        return;
      }
      return decoded;
    }
  );

  return tokenDecodedPayload;
};

const getPermissionFiltered = (permissionToCheck, permissions) => {
  const paths = permissionToCheck.split(".");

  let isAllowed = { ...permissions };

  paths.map(path => {
    isAllowed = isAllowed[path];
  });
  return isAllowed;
};

const checkRoleAuthorization = (
  permissionToCheck,
  Model = null,
  objectIdName = null
) => {
  return async (req, res, next) => {
    let modelInstance;
    const tokenDecodedPayload = await checkValidToken(req, next);

    let user = { permissions: User.getPermissions() };

    if (tokenDecodedPayload && tokenDecodedPayload.userId) {
      user = await User.findById(tokenDecodedPayload.userId);
      if (!user) {
        return stopRequest(next, req);
      }

      user.permissions = User.getPermissions(user.role);
      req.user = user;
    }

    const permissionValues = getPermissionFiltered(
      permissionToCheck,
      user.permissions
    );

    if (!permissionValues.own && !permissionValues.others) {
      return stopRequest(next, req);
    }

    if (!Model && !objectIdName && !permissionValues.own) {
      return stopRequest(next, req);
    }

    if (Model && objectIdName) {
      const objectId = req.params[objectIdName];
      modelInstance = await Model.findById(objectId);

      if (!modelInstance) {
        return stopRequestNotFound(next, req);
      }

      const creator =
        modelInstance instanceof User
          ? modelInstance.id.toString()
          : modelInstance.creators.toString();

      if (creator !== tokenDecodedPayload.userId && !permissionValues.others) {
        return stopRequest(next, req);
      }
    }

    req.documentToManipulate = modelInstance;

    next();
  };
};

module.exports = checkRoleAuthorization;
