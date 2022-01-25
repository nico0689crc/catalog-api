postCategoryRules = body => {
  return [
    body("name")
      .isLength({ min: 10 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.categories_rules.post_categories.name");
      }),
    body("description")
      .isLength({ min: 30 })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.categories_rules.post_categories.description"
        );
      }),
  ];
};

patchCategoryRules = body => {
  return [
    body("name")
      .isLength({ min: 10 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.categories_rules.patch_categories.name");
      }),
    body("description")
      .isLength({ min: 30 })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.categories_rules.patch_categories.description"
        );
      }),
  ];
};

module.exports = {
  postCategoryRules,
  patchCategoryRules,
};
