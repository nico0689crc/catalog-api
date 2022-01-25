const { Tag } = require("../../models");

const postTagRules = body => {
  return [
    body("name")
      .isLength({ min: 4 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.tags_rules.post_tag.name");
      }),
  ];
};

const patchTagRules = body => {
  return [
    body("name")
      .isLength({ min: 4 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.tags_rules.patch_tag.name");
      }),
  ];
};

module.exports = {
  postTagRules,
  patchTagRules,
};
