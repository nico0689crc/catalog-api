const fs = require("fs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const { QueryBuilder } = require("../shared");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { globalConfig } = require("../config");

const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Why no name?"] },
    description: { type: String },
    images: [
      {
        original: {
          url: { type: String, default: null },
          path: { type: String, default: null },
          active: { type: Boolean, default: true },
        },
        thumbnail: {
          url: { type: String, default: null },
          path: { type: String, default: null },
          active: { type: Boolean, default: true },
        },
      },
    ],
    quantity: { type: Number, min: 0, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    slug: { type: String, default: null },
    active: { type: Boolean, default: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    categories: { type: Schema.Types.ObjectId, ref: "Category" },
    creators: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    autoIndex: false,
    autoCreate: false,
    optimisticConcurrency: true,
    timestamps: true,
  }
);

productSchema.virtual("entity").get(function () {
  return "products";
});

productSchema.statics.getEntity = function () {
  return "products";
};

productSchema.statics.getRelatedColletions = function () {
  return [
    { path: "tags", fields: ["name", "slug"] },
    { path: "comments", fields: ["body", "creators"] },
    {
      path: "categories",
      fields: ["name", "description", "images", "icon", "slug"],
    },
    { path: "creators", fields: ["name", "email", "avatar", "role"] },
  ];
};

productSchema.statics.getFieldsToSelect = function () {
  return [
    "name",
    "description",
    "images",
    "quantity",
    "price",
    "price_sale",
    "discount",
    "slug",
    "active",
  ];
};

productSchema.statics.findCustom = async function (query) {
  const queryBuider = new QueryBuilder(this, query);
  const { countDocuments: totalProducts, documents: products } =
    await queryBuider.getCollections();
  return { totalProducts, products };
};

productSchema.statics.findByIdCustom = async function (productId) {
  const relatedCollections = this.getRelatedColletions();
  const product = await this.findById(productId);

  await this.populate(product, relatedCollections);

  return product;
};

productSchema.statics.createCustomTesting = async function (attributes) {
  const Tag = require("./tag");
  const Category = require("./category");
  const User = require("./user");
  const relatedCollections = this.getRelatedColletions();

  const slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  const images = [];

  for (const image of attributes.images) {
    images.push({
      original: { url: image },
      thumbnail: { url: image },
    });
  }

  const product = await this.create({
    ...attributes,
    images,
    slug,
  });

  await Tag.updateMany(
    { _id: attributes.tags },
    { $push: { products: product._id } }
  );

  await Category.updateMany(
    { _id: attributes.categories },
    { $push: { products: product._id } }
  );

  await User.updateMany(
    { _id: attributes.creators },
    { $push: { products: product._id } }
  );

  await this.populate(product, relatedCollections);

  return product;
};

productSchema.statics.createCustom = async function (attributes, req) {
  const Tag = require("./tag");
  const Category = require("./category");
  const User = require("./user");
  const relatedCollections = this.getRelatedColletions();

  const slug = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  if (attributes.tags.trim().length > 0) {
    attributes.tags = attributes.tags.split(",");
  } else {
    delete attributes.tags;
  }

  if (attributes.categories.trim().length === 0) {
    delete attributes.categories;
  }
  const images = [];

  if (req.files) {
    for (const image of req.files) {
      images.push({
        original: {
          url: `${globalConfig.server_url_base}/${image.path}`,
          path: image.path,
        },
        thumbnail: {
          url: `${globalConfig.server_url_base}/${image.path}`,
          path: image.path,
        },
      });
    }
  } else {
    images.push({
      original: { url: "" },
      thumbnail: { url: "" },
    });
  }
  const product = await this.create({
    ...attributes,
    images,
    slug,
  });

  attributes.tags &&
    (await Tag.updateMany(
      { _id: attributes.tags },
      { $push: { products: product._id } }
    ));

  await Category.updateMany(
    { _id: attributes.categories },
    { $push: { products: product._id } }
  );

  await User.updateMany(
    { _id: attributes.creators },
    { $push: { products: product._id } }
  );

  await this.populate(product, relatedCollections);

  return product;
};

productSchema.statics.updateCustom = async function (
  productId,
  attributes,
  req
) {
  const Tag = require("./tag");
  const Category = require("./category");
  const relatedCollections = this.getRelatedColletions();
  const product = await this.findById(productId);

  const images = [];

  for (let i = 0; i < product["images"].length; i++) {
    const image = product["images"][i];

    const index = attributes["currentImages"]
      ? attributes["currentImages"].findIndex(
          imageCurrent => image._id.toString() === imageCurrent
        )
      : -1;

    if (index < 0) {
      image.original.path && fs.unlink(image.original.path, err => {});
    } else {
      images.push(image);
    }
  }

  if (req.files) {
    for (const image of req.files) {
      images.push({
        original: {
          url: `${globalConfig.server_url_base}/${image.path}`,
          path: image.path,
        },
        thumbnail: {
          url: `${globalConfig.server_url_base}/${image.path}`,
          path: image.path,
        },
      });
    }
  } else {
    images.push({
      original: { url: "" },
      thumbnail: { url: "" },
    });
  }

  for (const key in attributes) {
    product[key] = attributes[key];
  }

  product["images"] = images;

  product["tags"] =
    attributes.tags.trim().length > 0 ? attributes.tags.split(",") : [];

  product["slug"] = `${slugify(attributes.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })}-${uuidv4()}`;

  await Tag.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  await Tag.updateMany(
    { _id: product.tags },
    { $push: { products: product._id } }
  );

  await Category.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  await Category.updateMany(
    { _id: attributes.categories },
    { $push: { products: product._id } }
  );

  await product.save();

  await this.populate(product, relatedCollections);

  return product;
};

productSchema.statics.deleteCustom = async function (productId) {
  const Tag = require("./tag");
  const Category = require("./category");
  const Comment = require("./comment");

  const product = await this.findById(productId);

  product.images.map(image => {
    if (image.original.path) {
      fs.unlink(image.original.path, err => {});
    }
  });

  await Tag.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  await Category.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  await Comment.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  await this.findByIdAndDelete(productId);

  return product;
};

//RELATIONSHIPS

//** Related
productSchema.statics.findTagsByProduct = async function (productId, query) {
  const Tag = require("./tag");
  const queryBuider = new QueryBuilder(Tag, query);

  const { countDocuments: totalTags, documents: tags } =
    await queryBuider.getCollections({
      products: ObjectId(productId),
    });

  return { totalTags, tags };
};

productSchema.statics.findCommentsByProduct = async function (
  productId,
  query
) {
  const Comment = require("./comment");
  const queryBuider = new QueryBuilder(Comment, query);

  const { countDocuments: totalComments, documents: comments } =
    await queryBuider.getCollections({
      products: ObjectId(productId),
    });

  return { totalComments, comments };
};

productSchema.statics.findCreatorByProduct = async function (productId) {
  const User = require("./user");
  const product = await this.findById(productId);
  const creator = await model.findById(product.creators);
  return creator;
};

productSchema.statics.findCategoryByProduct = async function (productId) {
  const Category = require("./category");
  const product = await this.findById(productId);
  const category = await Category.findById(product.categories);
  return category;
};

module.exports = mongoose.model("Product", productSchema);
