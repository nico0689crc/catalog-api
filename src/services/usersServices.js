const { expressValidatorResult } = require("../middlewares");
const { tryCatch, ResponseParser } = require("../shared");
const { User, Product } = require("../models");

const getUsers = async (req, res, next) => {
  tryCatch(async () => {
    const { page, filter: filters, sort } = req.query;

    const { totalUsers, users } = await User.findCustom({
      page,
      filters,
      sort,
    });

    const response = new ResponseParser({
      model: User,
      documents: users,
      request: req,
      totalDocuments: totalUsers,
    });
    response.parseDataCollection();
    response.sendResponseGetSuccess(res);
  }, next);
};

const getUser = async (req, res, next) => {
  tryCatch(async () => {
    const { userId } = req.params;

    const user = await User.findByIdCustom(userId);

    const response = new ResponseParser({
      model: User,
      documents: user,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const patchUser = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);

    const { userId } = req.params;
    const attributes = req.body;
    const { t } = req;

    const user = await User.updateCustom(userId, attributes, t);

    const response = new ResponseParser({
      model: User,
      documents: user,
      request: req,
    });
    response.parseDataIndividual();
    response.sendResponseUpdateSuccess(res);
  }, next);
};

const deleteUser = async (req, res, next) => {
  tryCatch(async () => {
    const { userId } = req.params;

    await User.deleteCustom(userId);

    const response = new ResponseParser({});
    response.sendResponseDeleteSuccess(res);
  }, next);
};

const authenticateUser = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);

    const { email, password } = req.body;

    const user = await User.authenticate(email, password, req);

    const response = new ResponseParser({
      model: User,
      documents: user,
      request: req,
    });
    response.fieldsToSelect.push("token");
    response.fieldsToSelect.push("permissions");
    response.parseDataIndividual();
    response.sendResponseGetSuccess(res);
  }, next);
};

const registerUser = async (req, res, next) => {
  tryCatch(async () => {
    await expressValidatorResult(req);
    const { t } = req;

    const attributes = { ...req.body };
    await User.register(attributes, t);

    const response = new ResponseParser({});
    response.sendResponseUserRegisterSuccess(res);
  }, next);
};

const requestResetPassword = async (req, res, next) => {
  tryCatch(async () => {
    // await expressValidatorResult(req);
    const attributes = { ...req.body };
    await User.generateResetPassword(attributes, req);

    const response = new ResponseParser({});
    response.sendResponseResetPasswordSuccess(res);
  }, next);
};

const resetPassword = async (req, res, next) => {
  tryCatch(async () => {
    // await expressValidatorResult(req);
    const attributes = { ...req.body };
    await User.verifyResetPassword(attributes, req);

    const response = new ResponseParser({});
    response.sendResponseResetPasswordSuccess(res);
  }, next);
};

const verifyEmailAccount = async (req, res, next) => {
  tryCatch(async () => {
    // await expressValidatorResult(req);
    const attributes = { ...req.body };
    await User.verifyEmailAccount(attributes, req);

    const response = new ResponseParser({});
    response.sendResponseResetPasswordSuccess(res);
  }, next);
};
//RELATIONSHIPS

//** Related
const getProductsByUser = async (req, res, next) => {
  tryCatch(async () => {
    const userId = req.params.userId;
    const { page, filter: filters, sort } = req.query;

    const productsData = await User.findProductsByUser(userId, {
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

module.exports = {
  getUsers,
  getUser,
  patchUser,
  deleteUser,
  registerUser,
  authenticateUser,
  verifyEmailAccount,
  getProductsByUser,
  requestResetPassword,
  resetPassword,
};
