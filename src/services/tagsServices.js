const { expressValidatorResult } = require("../middlewares");
const { tryCatch, ResponseParser } = require("../shared");
const { Tag, Product, User } = require("../models");

const getTags = async (req, res, next) => {
  tryCatch(async () => {
    const { page, filter: filters, sort } = req.query;

    const { totalTags, tags } = await Tag.findCustom({
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: Tag,
      documents: tags,
      request: req,
      totalDocuments: totalTags,
    });
    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getTag = async (req, res, next) => {
  tryCatch(async () => {
    const { tagId } = req.params;

    const tag = await Tag.findByIdCustom(tagId);

    const response = new ResponseParser({
      model: Tag,
      documents: tag,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const postTag = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const attributes = { ...req.body, creators: req.user._id };

    const tag = await Tag.createCustom(attributes);

    const response = new ResponseParser({
      model: Tag,
      documents: tag,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseCreateSuccess(res);
  }, next);
};

const patchTag = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);

    const { tagId } = req.params;
    const attributes = req.body;

    const tag = await Tag.updateCustom(tagId, attributes);

    const response = new ResponseParser({
      model: Tag,
      documents: tag,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseUpdateSuccess(res);
  }, next);
};

const deleteTag = async (req, res, next) => {
  tryCatch(async () => {
    const { tagId } = req.params;

    await Tag.deleteCustom(tagId, req, next);

    const response = new ResponseParser({});
    response.sendResponseDeleteSuccess(res);
  }, next);
};

//RELATIONSHIPS

//** Related
const getProductsByTag = async (req, res, next) => {
  tryCatch(async () => {
    const tagId = req.params.tagId;
    const { page, filter: filters, sort } = req.query;
    const productsData = await Tag.findProductsByTag(tagId, {
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

const getCreatorByTag = async (req, res, next) => {
  tryCatch(async () => {
    const tagId = req.params.tagId;
    const creator = await Tag.findCreatorByTag(tagId);

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
  getTags,
  getTag,
  postTag,
  patchTag,
  deleteTag,
  getProductsByTag,
  getCreatorByTag,
};
