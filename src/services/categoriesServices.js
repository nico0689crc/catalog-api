const { expressValidatorResult } = require("../middlewares");
const { tryCatch, ResponseParser } = require("../shared");
const { Category, Product } = require("../models");

const getCategories = async (req, res, next) => {
  tryCatch(async () => {
    const { page, filter: filters, sort } = req.query;
    const { totalCategories, categories } = await Category.findCustom({
      page,
      filters,
      sort,
    });

    const responseCategories = new ResponseParser({
      model: Category,
      documents: categories,
      request: req,
      totalDocuments: totalCategories,
    });
    responseCategories.parseDataCollection();
    responseCategories.sendResponseGetSuccess(res);
  }, next);
};

const getCategory = async (req, res, next) => {
  tryCatch(async () => {
    const { categoryId } = req.params;

    const category = await Category.findByIdCustom(categoryId);

    const responseCategory = new ResponseParser({
      model: Category,
      documents: category,
      request: req,
    });
    responseCategory.parseDataIndividual();
    responseCategory.sendResponseGetSuccess(res);
  }, next);
};

const postCategory = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const attributes = { ...req.body, creators: req.user._id };
    const category = await Category.createCustom(attributes);

    const responseCategory = new ResponseParser({
      model: Category,
      documents: category,
      request: req,
    });
    responseCategory.parseDataIndividual();
    responseCategory.sendResponseCreateSuccess(res);
  }, next);
};

const patchCategory = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const { categoryId } = req.params;
    const attributes = req.body;

    const category = await Category.updateCustom(categoryId, attributes);

    const responseCategory = new ResponseParser({
      model: Category,
      documents: category,
      request: req,
    });
    responseCategory.parseDataIndividual();
    responseCategory.sendResponseUpdateSuccess(res);
  }, next);
};

const deleteCategory = async (req, res, next) => {
  tryCatch(async () => {
    const { categoryId } = req.params;

    await Category.deleteCustom(categoryId, req, next);

    const responseCategory = new ResponseParser({});
    responseCategory.sendResponseDeleteSuccess(res);
  }, next);
};

//RELATIONSHIPS
// ***** Self

// ***** Related
const getProductsByCategory = async (req, res, next) => {
  tryCatch(async () => {
    const categoryId = req.params.categoryId;
    const { page, filter: filters, sort } = req.query;
    const productsData = await Category.findProductsByCategory(categoryId, {
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: Product,
      documents: productsData.products,
      request: req,
      totalDocuments: productsData.totalProducts,
    });

    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getCreatorByCategory = async (req, res, next) => {
  tryCatch(async () => {
    const categoryId = req.params.categoryId;
    const category = await Category.findCreatorByCategory(categoryId);

    const response = new ResponseParser({
      model: Category,
      documents: category,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

module.exports = {
  getCategories,
  getCategory,
  postCategory,
  patchCategory,
  deleteCategory,
  getProductsByCategory,
  getCreatorByCategory,
};
