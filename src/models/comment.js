const mongoose = require("mongoose");
const { QueryBuilder } = require("../shared");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    body: { type: String },
    products: { type: Schema.Types.ObjectId, ref: "Product" },
    creators: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    autoIndex: false,
    autoCreate: false,
    optimisticConcurrency: true,
    timestamps: true,
  }
);

commentSchema.virtual("entity").get(function () {
  return "comments";
});

commentSchema.statics.getEntity = function () {
  return "comments";
};

commentSchema.statics.getRelatedColletions = function () {
  return [
    {
      path: "products",
      fields: [
        "name",
        "description",
        "images",
        "quantity",
        "price",
        "price_sale",
        "discount",
        "slug",
        "active",
      ],
    },
    { path: "creators", fields: ["name", "email", "avatar", "role"] },
  ];
};

commentSchema.statics.getFieldsToSelect = function () {
  return ["body"];
};

commentSchema.statics.findCustom = async function (query) {
  const queryBuider = new QueryBuilder(this, query);
  const { countDocuments: totalComments, documents: comments } =
    await queryBuider.getCollections();
  return { totalComments, comments };
};

commentSchema.statics.findByIdCustom = async function (commentId) {
  const relatedCollections = this.getRelatedColletions();
  const comment = await this.findById(commentId);

  await this.populate(comment, relatedCollections);

  return comment;
};

commentSchema.statics.createCustom = async function (attributes) {
  const Product = require("./product");
  const relatedCollections = this.getRelatedColletions();
  const comment = await this.create({
    ...attributes,
    products: attributes.product_id,
  });

  await Product.updateMany(
    {
      _id: attributes.product_id,
    },
    {
      $push: { comments: comment._id },
    }
  );

  await this.populate(comment, relatedCollections);

  return comment;
};

commentSchema.statics.updateCustom = async function (commentId, attributes) {
  const relatedCollections = this.getRelatedColletions();
  const comment = await this.findById(commentId);

  for (const key in attributes) {
    comment[key] = attributes[key];
  }

  await comment.save();

  await this.populate(comment, relatedCollections);

  return comment;
};

commentSchema.statics.deleteCustom = async function (commentId) {
  const Product = require("./product");
  const comment = await this.findById(commentId);

  await Product.updateMany(
    { comments: comment._id },
    { $pull: { comments: comment._id } }
  );

  await this.findByIdAndDelete(commentId);

  return comment;
};

//RELATIONSHIPS

//** Related

commentSchema.statics.findProductByComment = async function (commentId) {
  const Product = require("./product");
  const comment = await this.findById(commentId);
  const product = await Product.findById(comment.products);

  return product;
};

commentSchema.statics.findCreatorByComment = async function (commentId) {
  const User = require("./user");
  const comment = await this.findById(commentId);
  const creators = await User.findById(comment.creators);

  return creators;
};

module.exports = mongoose.model("Comment", commentSchema);
