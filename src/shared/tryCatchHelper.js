const ErrorResponseParser = require("./errorResponseParser");
const ResponsesTypes = require("./responseTypes");

async function tryCatch(callback, next) {
  try {
    await callback();
  } catch (error) {
    if (error instanceof ErrorResponseParser) {
      return next(error);
    }

    return next(
      new ErrorResponseParser(
        ResponsesTypes.errors.errors_500.error_internal_error,
        error.message
      )
    );
  }
}

module.exports = tryCatch;
