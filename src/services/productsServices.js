const { expressValidatorResult } = require("../middlewares");
const { tryCatch, ResponseParser } = require("../shared");
const { Product, Tag, Comment, Category, User } = require("../models");

const getProducts = async (req, res, next) => {
  tryCatch(async () => {
    const { page, filter: filters, sort } = req.query;

    const { totalProducts, products } = await Product.findCustom({
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: Product,
      documents: products,
      request: req,
      totalDocuments: totalProducts,
    });
    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getProduct = async (req, res, next) => {
  tryCatch(async () => {
    const { productId } = req.params;

    const product = await Product.findByIdCustom(productId);

    const response = new ResponseParser({
      model: Product,
      documents: product,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const postProduct = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);

    const attributes = { ...req.body, creators: req.user._id };

    const product = await Product.createCustom(attributes, req);

    const response = new ResponseParser({
      model: Product,
      documents: product,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseCreateSuccess(res);
  }, next);
};

const patchProduct = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);

    const { productId } = req.params;
    const attributes = req.body;

    const product = await Product.updateCustom(productId, attributes, req);

    const response = new ResponseParser({
      model: Product,
      documents: product,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseUpdateSuccess(res);
  }, next);
};

const deleteProduct = async (req, res, next) => {
  tryCatch(async () => {
    const { productId } = req.params;

    await Product.deleteCustom(productId);

    const response = new ResponseParser({});
    response.sendResponseDeleteSuccess(res);
  }, next);
};

//RELATIONSHIPS

//** Related
const getTagsByProduct = async (req, res, next) => {
  tryCatch(async () => {
    const productId = req.params.productId;
    const { page, filter: filters, sort } = req.query;
    const tagsData = await Product.findTagsByProduct(productId, {
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: Tag,
      documents: tagsData.tags,
      request: req,
      totalDocuments: tagsData.totalTags,
    });

    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getCommentsByProduct = async (req, res, next) => {
  tryCatch(async () => {
    const productId = req.params.productId;
    const { page, filter: filters, sort } = req.query;
    const commentsData = await Product.findCommentsByProduct(productId, {
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: Comment,
      documents: commentsData.comments,
      request: req,
      totalDocuments: commentsData.totalComments,
    });

    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getCategoryByProduct = async (req, res, next) => {
  tryCatch(async () => {
    const productId = req.params.productId;
    const category = await Product.findCategoryByProduct(productId);

    const response = new ResponseParser({
      model: Category,
      documents: category,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getCreatorByProduct = async (req, res, next) => {
  tryCatch(async () => {
    const productId = req.params.productId;
    const creator = await Product.findCreatorByProduct(productId);

    const response = new ResponseParser({
      model: User,
      documents: creator,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

module.exports = {
  getProducts,
  getProduct,
  postProduct,
  patchProduct,
  deleteProduct,
  getTagsByProduct,
  getCommentsByProduct,
  getCategoryByProduct,
  getCreatorByProduct,
};
