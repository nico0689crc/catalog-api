const ResponsesTypes = {
  errors: {
    errors_400: {
      error_route_not_found: {
        httpStatusCode: 404,
      },
      error_resource_not_found: {
        httpStatusCode: 404,
      },
      error_input_validation: {
        httpStatusCode: 400,
      },
      error_processing_resource: {
        httpStatusCode: 404,
      },
      error_authentication_credential_incorrect: {
        httpStatusCode: 404,
      },
      error_email_verification_required: {
        httpStatusCode: 400,
      },
      error_email_verificated: {
        httpStatusCode: 400,
      },
      error_password_token_incorrect: {
        httpStatusCode: 400,
      },
      error_token_no_provided: {
        httpStatusCode: 400,
      },
      error_token_invalid: {
        httpStatusCode: 400,
      },
      error_token_without_authorization: {
        httpStatusCode: 403,
      },
    },
    errors_500: {
      error_internal_error: {
        httpStatusCode: 500,
      },
      error_database_connection: {
        httpStatusCode: 503,
      },
      error_database_disconnection: {
        httpStatusCode: 503,
      },
    },
  },
  success: {
    success_200: {
      success_resource_get_success: {
        httpStatusCode: 200,
      },
      success_resource_created_success: {
        httpStatusCode: 201,
      },
      success_resource_updated_success: {
        httpStatusCode: 200,
      },
      success_resource_deleted_success: {
        httpStatusCode: 204,
      },
      success_reset_password_success: {
        httpStatusCode: 204,
      },
      success_user_register_success: {
        httpStatusCode: 204,
      },
      success_user_authentication_success: {
        httpStatusCode: 200,
      },
    },
  },
};

module.exports = ResponsesTypes;
