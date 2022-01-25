class ErrorResponseParser extends Error {
  constructor(responseTypes, errorsObjects = {}, message = "") {
    super(message);
    this.httpStatusCode = responseTypes.httpStatusCode;
    this.errorsObjects = errorsObjects;
  }

  getResponseBody() {
    return this.errorsObjects;
  }

  getHttpStatusCode() {
    return this.httpStatusCode;
  }
}

module.exports = ErrorResponseParser;
