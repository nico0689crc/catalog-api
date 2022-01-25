const { User } = require("../../models");

const getUserAuthenticationRules = body => {
  return [
    body("email")
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.get_user_authentication.email"
        );
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.get_user_authentication.password"
        );
      }),
  ];
};

const postUserRules = body => {
  return [
    body("name")
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.users_rules.post_user.name");
      }),
    body("email")
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.post_user.email.email_format"
        );
      })
      .custom(async value => {
        await User.verifyExistingEmail(value, user => {
          if (user) {
            return Promise.reject("Existing email");
          }
        });
      })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.post_user.email.unique_email"
        );
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.users_rules.post_user.password");
      }),
  ];
};

const patchUserRules = body => {
  return [
    body("name")
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.users_rules.patch_user.name");
      }),
    body("email")
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.patch_user.email.email_format"
        );
      })
      .custom(async (value, { req, res, next }) => {
        await User.verifyExistingEmail(value, user => {
          if (user.email !== value) {
            return Promise.reject("Existing email");
          }
        });
      })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.users_rules.patch_user.email.unique_email"
        );
      }),
  ];
};

module.exports = {
  postUserRules,
  patchUserRules,
  getUserAuthenticationRules,
};
