const fs = require("fs");
const { ErrorResponseParser } = require("../shared");

const globalErrorHandler = (error, req, res, next) => {
  if (req.files) {
    for (const file of req.files) {
      fs.unlink(file.path, err => {});
    }
  }

  if (error instanceof ErrorResponseParser) {
    res.status(error.httpStatusCode).json({ errors: error.getResponseBody() });
  }
};

module.exports = globalErrorHandler;
