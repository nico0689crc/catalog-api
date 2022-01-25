const { ErrorResponseParser, ResponsesTypes } = require("../shared");

const checkValidObjectId = (paramIdName, model) => {
  return async (req, res, next) => {
    const objectId = req.params[paramIdName];

    if (!objectId.match(/^[0-9a-fA-F]{24}$/)) {
      const errorsObjects = [
        {
          source: {
            pointer: `ID: ${objectId}`,
          },
          title: req.t("middleware.check_valid_object_id.title"),
          detail: req.t("middleware.check_valid_object_id.detail"),
        },
      ];

      return next(
        new ErrorResponseParser(
          ResponsesTypes.errors.errors_400.error_resource_not_found,
          errorsObjects
        )
      );
    }

    const document = await model.findById(objectId);

    if (!document) {
      return next(
        new ErrorResponseParser(
          ResponsesTypes.errors.errors_400.error_resource_not_found,
          [
            {
              source: {
                pointer: req.originalUrl,
              },
              title: req.t("middleware.resource_not_found.title"),
              detail: req.t("middleware.resource_not_found.detail"),
            },
          ]
        )
      );
    }

    next();
  };
};

module.exports = checkValidObjectId;
