const sendgridEmail = require("@sendgrid/mail");
const globalConfig = require("../config/global");
const ErrorResponseParser = require("./errorResponseParser");
const ResponsesTypes = require("./responseTypes");

const emailSender = async params => {
  const { emailAddressToSend, emailSubject, emailBody } = params;

  try {
    sendgridEmail.setApiKey(globalConfig.sendgrid_api_key);

    const sendGridMessage = {
      to: emailAddressToSend,
      from: globalConfig.sendgrid_email_from,
      subject: emailSubject,
      html: emailBody,
    };

    await sendgridEmail.send(sendGridMessage);
  } catch (error) {
    const errorsObjects = error.response.body.errors.map(error => {
      return {
        source: {
          pointer: "@sendgrid/mail",
        },
        title: "Problems with email sending service.",
        detail: error.message,
      };
    });

    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_500.error_internal_error,
      errorsObjects
    );
  }
};

module.exports = emailSender;
