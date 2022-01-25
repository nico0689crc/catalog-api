const { ErrorResponseParser, ResponsesTypes } = require("../shared");

const unknownEndpoint = (req, res, next) => {
  const errorObject = [
    {
      source: {
        pointer: req.path,
      },
      title: req.t("middleware.unknown_endpoint.title"),
      detail: req.t("middleware.unknown_endpoint.detail"),
    },
  ];

  return next(
    new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_route_not_found,
      errorObject
    )
  );
};

module.exports = unknownEndpoint;
