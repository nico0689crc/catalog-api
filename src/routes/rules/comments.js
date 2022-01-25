const { Product } = require("../../models");
const { checkValidObjectId } = require("../../middlewares");

postCommentRules = body => {
  return [
    body("data.attributes.body")
      .isLength({ min: 10 })
      .withMessage((value, { req }) => {
        return req.t("validation_rules.comments_rules.post_comment.body");
      }),
    body("data.attributes.product_id")
      .custom(async value => {
        const product = await Product.findById(value);
        if (!product) {
          return Promise.reject("Rejected");
        }
      })
      .withMessage((value, { req }) => {
        return req.t(
          "validation_rules.comments_rules.post_comment.product_not_found"
        );
      }),
  ];
};

patchCommentRules = body => {
  return [
    body("data.attributes.body")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage((value, { req }) => {
        return req.t("validation_rules.comments_rules.patch_comment.body");
      }),
  ];
};

module.exports = {
  postCommentRules,
  patchCommentRules,
};
