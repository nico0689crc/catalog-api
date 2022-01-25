const { validationResult } = require("express-validator");

const { ErrorResponseParser, ResponsesTypes } = require("../shared");

const expressValidatorResult = async req => {
  const errors = await validationResult(req);

  const parseErrorObject = errors => {
    const errorsObjects = errors.errors.map(error => {
      return {
        source: {
          location: error.location,
          pointer: error.param,
        },
        title: req.t("middleware.validators.title"),
        detail: error.msg,
      };
    });
    return errorsObjects;
  };

  if (!errors.isEmpty()) {
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_input_validation,
      parseErrorObject(errors)
    );
  }
};

module.exports = expressValidatorResult;
