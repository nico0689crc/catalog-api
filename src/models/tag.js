const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const {
  QueryBuilder,
  ResponsesTypes,
  ErrorResponseParser,
} = require("../shared");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

const tagSchema = new Schema(
  {
    name: { type: String, required: [true, "Why no name?"] },
    slug: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    creators: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    autoIndex: false,
    autoCreate: false,
    optimisticConcurrency: true,
    timestamps: true,
  }
);

tagSchema.virtual("entity").get(function () {
  return "tags";
});

tagSchema.statics.getEntity = function () {
  return "tags";
};

tagSchema.statics.getRelatedColletions = function () {
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

tagSchema.statics.getFieldsToSelect = function () {
  return ["name", "slug"];
};

tagSchema.statics.findCustom = async function (query) {
  const queryBuider = new QueryBuilder(this, query);
  const { countDocuments: totalTags, documents: tags } =
    await queryBuider.getCollections();
  return { totalTags, tags };
};

tagSchema.statics.findByIdCustom = async function (tagId) {
  const relatedCollections = this.getRelatedColletions();
  const tag = await this.findById(tagId);

  await this.populate(tag, relatedCollections);

  return tag;
};

tagSchema.statics.createCustom = async function (attributes) {
  const relatedCollections = this.getRelatedColletions();

  const slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  const tag = await this.create({ ...attributes, slug });

  await this.populate(tag, relatedCollections);

  return tag;
};

tagSchema.statics.updateCustom = async function (tagId, attributes) {
  const relatedCollections = this.getRelatedColletions();
  const tag = await this.findById(tagId);

  for (const key in attributes) {
    tag[key] = attributes[key];
  }

  tag.slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  await tag.save();

  await this.populate(tag, relatedCollections);

  return tag;
};

tagSchema.statics.deleteCustom = async function (tagId, req, next) {
  const Product = require("./product");
  const tag = await this.findById(tagId);

  if (tag.products.length > 0) {
    const errorsObjects = [
      {
        source: {
          pointer: req.originalUrl,
        },
        title: req.t(
          "services.tags_services.delete_resource_with_relation.title"
        ),
        detail: req.t(
          "services.tags_services.delete_resource_with_relation.detail"
        ),
      },
    ];
    return next(
      new ErrorResponseParser(
        ResponsesTypes.errors.errors_400.error_processing_resource,
        errorsObjects
      )
    );
  }

  await Product.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });

  await this.findByIdAndDelete(tagId);

  return tag;
};

tagSchema.statics.verifyExistingSlug = async function (slug, callback) {
  await this.findOne({ slug: slug }).then(callback);
};
//RELATIONSHIPS

//** Related
tagSchema.statics.findProductsByTag = async function (tagId, query) {
  const Product = require("./product");
  const queryBuider = new QueryBuilder(Product, query);
  const { countDocuments: totalProducts, documents: products } =
    await queryBuider.getCollections({
      tags: ObjectId(tagId),
    });
  return { totalProducts, products };
};

tagSchema.statics.findCreatorByTag = async function (tagId) {
  const User = require("./user");
  const tag = await this.findById(tagId);
  const creators = await User.findById(tag.creators);

  return creators;
};

module.exports = mongoose.model("Tag", tagSchema);
