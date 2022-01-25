const { expressValidatorResult } = require("../middlewares");
const { tryCatch, ResponseParser } = require("../shared");
const { Comment, Product, User } = require("../models");

const getComments = async (req, res, next) => {
  tryCatch(async () => {
    const { page, filter: filters, sort } = req.query;

    const { totalComments, comments } = await Comment.findCustom({
      page,
      filters,
      sort,
    });

    const responseComments = new ResponseParser({
      model: Comment,
      documents: comments,
      request: req,
      totalDocuments: totalComments,
    });

    responseComments.parseDataCollection();
    responseComments.sendResponseGetSuccess(res);
  }, next);
};

const getComment = async (req, res, next) => {
  tryCatch(async () => {
    const { commentId } = req.params;

    const comment = await Comment.findByIdCustom(commentId);

    const responseComment = new ResponseParser({
      model: Comment,
      documents: comment,
      request: req,
    });

    responseComment.parseDataIndividual();
    responseComment.sendResponseGetSuccess(res);
  }, next);
};

const postComment = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const attributes = { ...req.body.data.attributes, creators: req.user._id };

    const comment = await Comment.createCustom(attributes);

    const responseComment = new ResponseParser({
      model: Comment,
      documents: comment,
      request: req,
    });

    responseComment.parseDataIndividual();
    responseComment.sendResponseCreateSuccess(res);
  }, next);
};

const patchComment = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const { commentId } = req.params;
    const attributes = req.body.data.attributes;

    const comment = await Comment.updateCustom(commentId, attributes);

    const responseComment = new ResponseParser({
      model: Comment,
      documents: comment,
      request: req,
    });

    responseComment.parseDataIndividual();
    responseComment.sendResponseUpdateSuccess(res);
  }, next);
};

const deleteComment = async (req, res, next) => {
  tryCatch(async () => {
    const { commentId } = req.params;

    await Comment.deleteCustom(commentId);

    const responseComment = new ResponseParser({});
    responseComment.sendResponseDeleteSuccess(res);
  }, next);
};

//RELATIONSHIPS
// ***** Self

// ***** Related
const getProductByComment = async (req, res, next) => {
  tryCatch(async () => {
    const commentId = req.params.commentId;
    const product = await Comment.findProductByComment(commentId);

    const response = new ResponseParser({
      model: Product,
      documents: product,
      request: req,
    });

    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getCreatorByComment = async (req, res, next) => {
  tryCatch(async () => {
    const commentId = req.params.commentId;
    const creator = await Comment.findCreatorByComment(commentId);

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
  getComments,
  getComment,
  postComment,
  patchComment,
  deleteComment,
  getProductByComment,
  getCreatorByComment,
};
