const unknownEndpoint = require("./unknownEndpoint");
const globalErrorHandler = require("./globalErrorHandler");
const checkValidObjectId = require("./checkValidObjectId");
const checkRolesAuthorization = require("./checkRolesAuthorization");
const expressValidatorResult = require("./expressValidatorResult");
const fileUploadMulter = require("./fileUploadMulter");

module.exports = {
  unknownEndpoint,
  globalErrorHandler,
  checkValidObjectId,
  checkRolesAuthorization,
  expressValidatorResult,
  fileUploadMulter,
};
