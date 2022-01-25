const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const Product = require("./product");
const {
  QueryBuilder,
  ResponsesTypes,
  ErrorResponseParser,
} = require("../shared");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

const categorySchema = new Schema(
  {
    name: { type: String, required: [true, "Why no name?"] },
    description: { type: String },
    icon: { type: String, default: null },
    slug: { type: String, default: null },
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

categorySchema.virtual("entity").get(function () {
  return "categories";
});

categorySchema.statics.getEntity = function () {
  return "categories";
};

categorySchema.statics.getRelatedColletions = function () {
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

categorySchema.statics.getFieldsToSelect = function () {
  return ["name", "description", "images", "icon", "slug"];
};

categorySchema.statics.findCustom = async function (query) {
  const queryBuider = new QueryBuilder(this, query);
  const { countDocuments: totalCategories, documents: categories } =
    await queryBuider.getCollections();
  return { totalCategories, categories };
};

categorySchema.statics.findByIdCustom = async function (categorId) {
  const relatedCollections = this.getRelatedColletions();
  const category = await this.findById(categorId);

  await this.populate(category, relatedCollections);

  return category;
};

categorySchema.statics.createCustom = async function (attributes) {
  const relatedCollections = this.getRelatedColletions();

  const slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  const category = await this.create({ ...attributes, slug });

  await this.populate(category, relatedCollections);

  return category;
};

categorySchema.statics.updateCustom = async function (categorId, attributes) {
  const relatedCollections = this.getRelatedColletions();
  const category = await this.findById(categorId);

  for (const key in attributes) {
    if (!key !== "creators" || !key !== "products") {
      category[key] = attributes[key];
    }
  }

  category.slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  await category.save();

  await this.populate(category, relatedCollections);

  return category;
};

categorySchema.statics.deleteCustom = async function (categorId, req, next) {
  const category = await this.findById(categorId);

  if (category.products.length > 0) {
    const errorsObjects = [
      {
        source: {
          pointer: req.originalUrl,
        },
        title: req.t(
          "services.categories_services.delete_resource_with_relation.title"
        ),
        detail: req.t(
          "services.categories_services.delete_resource_with_relation.detail"
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

  await Product.updateMany(
    { categories: category._id },
    { $pull: { categories: category._id } }
  );

  await this.findByIdAndDelete(categorId);

  return category;
};

//RELATIONSHIPS

//** Related

categorySchema.statics.findProductsByCategory = async function (
  categorId,
  query
) {
  const Product = require("./product");
  const queryBuider = new QueryBuilder(Product, query);
  const { countDocuments: totalProducts, documents: products } =
    await queryBuider.getCollections({
      categories: ObjectId(categorId),
    });

  return { totalProducts, products };
};

categorySchema.statics.findCreatorByCategory = async function (categorId) {
  const User = require("./user");
  const category = await this.findById(categorId);
  const creators = await User.findById(category.creators);

  return creators;
};

module.exports = mongoose.model("Category", categorySchema);
