const postProductRules = body => {
  return [
    body("name")
      .isLength({ min: 10 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.post_products.name");
      }),
    body("description")
      .isLength({ min: 30 })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.products_rules.post_products.description"
        );
      }),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.post_products.quantity");
      }),
    body("price")
      .isDecimal({ decimal_digits: "0," })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.post_products.price");
      }),
  ];
};

const patchProductRules = body => {
  return [
    body("name")
      .isLength({ min: 10 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.patch_products.name");
      }),
    body("description")
      .isLength({ min: 30 })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.products_rules.patch_products.description"
        );
      }),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.patch_products.quantity");
      }),
    body("price")
      .isDecimal({ decimal_digits: "0," })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.products_rules.patch_products.price");
      }),
  ];
};

module.exports = {
  postProductRules,
  patchProductRules,
};
