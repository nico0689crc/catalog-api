const path = require("path");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { emailSender } = require("../shared");
const crypto = require("crypto");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const {
  ErrorResponseParser,
  ResponsesTypes,
  QueryBuilder,
} = require("../shared");
const { globalConfig } = require("../config");

const PENDING = "pending";
const ACTIVE = "active";
const LOCKED = "locked";

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    avatar: { type: String, default: null },
    token: { type: String, default: null },
    status: {
      type: String,
      enum: [PENDING, ACTIVE, LOCKED],
      default: PENDING,
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    role: { type: String, default: "user" },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    autoIndex: false,
    autoCreate: false,
    optimisticConcurrency: true,
    timestamps: true,
  }
);

userSchema.virtual("entity").get(function () {
  return "users";
});

userSchema.statics.getEntity = function () {
  return "users";
};

userSchema.statics.getPermissions = (role = "anonymous") => {
  const roles = {
    admin: {
      users: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
      products: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
      tags: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
      categories: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
      comments: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
      settings: {
        create: {
          own: true,
          others: true,
        },
        update: {
          own: true,
          others: true,
        },
        delete: {
          own: true,
          others: true,
        },
        get: {
          own: true,
          others: true,
        },
      },
    },
    user: {
      users: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: true,
          others: false,
        },
        delete: {
          own: true,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      products: {
        create: {
          own: true,
          others: false,
        },
        update: {
          own: true,
          others: false,
        },
        delete: {
          own: true,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      tags: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      categories: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      comments: {
        create: {
          own: true,
          others: false,
        },
        update: {
          own: true,
          others: false,
        },
        delete: {
          own: true,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      settings: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: false,
          others: false,
        },
      },
    },
    anonymous: {
      users: {
        create: {
          own: true,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      products: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      tags: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      categories: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      comments: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: true,
          others: true,
        },
      },
      settings: {
        create: {
          own: false,
          others: false,
        },
        update: {
          own: false,
          others: false,
        },
        delete: {
          own: false,
          others: false,
        },
        get: {
          own: false,
          others: false,
        },
      },
    },
  };

  return roles[role];
};

userSchema.statics.getRelatedColletions = function () {
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
  ];
};

userSchema.statics.getFieldsToSelect = function () {
  return ["name", "email", "avatar", "role", "status"];
};

userSchema.statics.verifyExistingEmail = async function (email, callback) {
  await this.findOne({ email: email }).then(callback);
};

userSchema.statics.findCustom = async function (query) {
  const queryBuider = new QueryBuilder(this, query);
  const { countDocuments: totalUsers, documents: users } =
    await queryBuider.getCollections();
  return { totalUsers, users };
};

userSchema.statics.findByIdCustom = async function (userId) {
  const relatedCollections = this.getRelatedColletions();
  const user = await this.findById(userId);

  await this.populate(user, relatedCollections);

  return user;
};

userSchema.statics.updateCustom = async function (
  userId,
  attributes,
  t,
  testing = false
) {
  const relatedCollections = this.getRelatedColletions();
  const user = await this.findById(userId);

  for (const key in attributes) {
    if (key !== "password") {
      user[key] = attributes[key];
    }
  }

  const confirmationCode = crypto.randomBytes(32).toString("hex");
  const confirmationCodeHashed = await bcryptjs.hash(confirmationCode, 12);
  user.confirmationCode = confirmationCodeHashed;

  if (!testing) {
    //Sendd Email to activate account
    const pathFile = path.join(__dirname, "../emails/registration.ejs");
    const title = t("emails.registration.title");
    const body = t("emails.registration.body").replace(/userName/, user.name);
    const button_label = t("emails.registration.button_label");
    const linkActivation = `${attributes.redirectionUrl}?confirmationCode=${confirmationCode}&userId=${user._id}`;

    const params = {
      title,
      body,
      button_label,
      linkActivation,
    };

    const emailTemplate = await ejs.renderFile(pathFile, params);

    await emailSender({
      emailAddressToSend: user.email,
      emailSubject: t("emails.registration.subject"),
      emailBody: emailTemplate,
    }).catch(error => {
      user.deleteOne();
      throw error;
    });
    //Sendd Email to activate account
  }

  await user.save();

  await this.populate(user, relatedCollections);

  return user;
};

userSchema.statics.deleteCustom = async function (userId, t) {
  const Tag = require("./tag");
  const Product = require("./product");
  const Category = require("./category");

  const tags = await Tag.findOne({ creators: userId });
  const products = await Product.findOne({ creators: userId });
  const categories = await Category.findOne({ creators: userId });
  const errorsObjects = [];

  if (tags) {
    errorsObjects.push({
      source: {
        pointer: "related/tags",
      },
      title: t("services.users_services.delete_user_with_tags.title"),
      detail: t("services.users_services.delete_user_with_tags.detail"),
    });
  }

  if (products) {
    errorsObjects.push({
      source: {
        pointer: "related/products",
      },
      title: t("services.users_services.delete_user_with_products.title"),
      detail: t("services.users_services.delete_user_with_products.detail"),
    });
  }

  if (categories) {
    errorsObjects.push({
      source: {
        pointer: "related/categories",
      },
      title: t("services.users_services.delete_user_with_categories.title"),
      detail: t("services.users_services.delete_user_with_categories.detail"),
    });
  }

  if (errorsObjects.length > 0) {
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_authentication_credential_incorrect,
      errorsObjects
    );
  }

  await this.findByIdAndDelete(userId);

  return;
};

userSchema.statics.authenticate = async function (email, password, req) {
  const relatedCollections = this.getRelatedColletions();
  const user = await this.findOne({ email });

  if (!user) {
    const errorsObjects = [
      {
        source: {
          pointer: "data/attributes/email",
        },
        title: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_authentication_credential_incorrect,
      errorsObjects
    );
  }

  const passwordIsValid = await bcryptjs.compare(password, user.password);

  if (!passwordIsValid) {
    const errorsObjects = [
      {
        source: {
          pointer: "data/attributes/password",
        },
        title: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_authentication_credential_incorrect,
      errorsObjects
    );
  }

  if (user.status === PENDING) {
    const errorsObjects = [
      {
        source: {
          pointer: "user/email-verification",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_activation_required.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_activation_required.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_email_verification_required,
      errorsObjects
    );
  }

  if (user.status === LOCKED) {
    const errorsObjects = [
      {
        source: {
          pointer: "user/blocked",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_locked.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_locked.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_email_verification_required,
      errorsObjects
    );
  }

  const credentials = { userId: user._id, email: user.email };
  const jwtKey = globalConfig.jwt_key;
  const expirationTime = { expiresIn: globalConfig.jwt_expiration_time };

  const token = await jwt.sign(credentials, jwtKey, expirationTime);

  user.token = token;
  user.permissions = this.getPermissions(user.role);

  await this.populate(user, relatedCollections);
  return user;
};

userSchema.statics.register = async function (attributes, t, testing = false) {
  let user;

  const relatedCollections = this.getRelatedColletions();
  const passwordHashed = await bcryptjs.hash(attributes.password, 12);

  const confirmationCode = crypto.randomBytes(32).toString("hex");
  const confirmationCodeHashed = await bcryptjs.hash(confirmationCode, 12);

  user = await this.create({
    ...attributes,
    password: passwordHashed,
    confirmationCode: confirmationCodeHashed,
  });

  const credentials = { userId: user._id, email: user.email };
  const jwtKey = globalConfig.jwt_key;
  const expirationTime = { expiresIn: globalConfig.jwt_expiration_time };

  const token = await jwt.sign(credentials, jwtKey, expirationTime);

  user.token = token;

  await this.populate(user, relatedCollections);

  if (!testing) {
    //Sendd Email to activate account
    const pathFile = path.join(__dirname, "../emails/registration.ejs");
    const title = t("emails.registration.title");
    const body = t("emails.registration.body").replace(/userName/, user.name);
    const button_label = t("emails.registration.button_label");
    const linkActivation = `${attributes.redirectionUrl}?confirmationCode=${confirmationCode}&userId=${user._id}`;

    const params = {
      title,
      body,
      button_label,
      linkActivation,
    };

    const emailTemplate = await ejs.renderFile(pathFile, params);

    await emailSender({
      emailAddressToSend: user.email,
      emailSubject: t("emails.registration.subject"),
      emailBody: emailTemplate,
    }).catch(error => {
      user.deleteOne();
      throw error;
    });
    //Sendd Email to activate account
  }

  return user;
};

userSchema.statics.verifyEmailAccount = async function (attributes, req) {
  const { confirmationCode, userId } = attributes;
  const user = await this.findById(userId);

  if (!user) {
    const errorsObjects = [
      {
        source: {
          pointer: "data/attributes/email",
        },
        title: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_authentication_credential_incorrect,
      errorsObjects
    );
  }

  if (user.status !== PENDING || user.confirmationCode === null) {
    const errorsObjects = [
      {
        source: {
          pointer: "email-verificated",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_actived_already.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_actived_already.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_email_verificated,
      errorsObjects
    );
  }

  const isValid = await bcryptjs.compare(
    confirmationCode,
    user.confirmationCode
  );

  if (!isValid) {
    const errorsObjects = [
      {
        source: {
          pointer: "code-verification-expired",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_code_virification_wrong.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_actived_already.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_email_verificated,
      errorsObjects
    );
  }

  await this.updateOne(
    { _id: userId },
    { $set: { status: "active", confirmationCode: null } }
  );

  return true;
};

userSchema.statics.generateResetPassword = async function (attributes, req) {
  const Token = require("./token");
  const { email } = attributes;
  const user = await this.findOne({ email: email });

  if (!user) {
    const errorsObjects = [
      {
        source: {
          pointer: "data/attributes/email",
        },
        title: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.credential_incorrect.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_authentication_credential_incorrect,
      errorsObjects
    );
  }
  const token = await Token.findOne({ creators: user._id });
  if (token) {
    await token.deleteOne();
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHashed = await bcryptjs.hash(resetToken, 12);

  const tokenCreated = await Token.create({
    creators: user._id,
    token: tokenHashed,
  });

  if (tokenCreated) {
    const pathFile = path.join(__dirname, "../emails/password-reset.ejs");
    const title = req.t("emails.password-reset.title");
    const body = req
      .t("emails.password-reset.body")
      .replace(/userName/, user.name);
    const button_label = req.t("emails.password-reset.button_label");
    const linkActivation = `${attributes.redirectionUrl}?token=${resetToken}&userId=${user._id}`;

    const params = {
      title,
      body,
      button_label,
      linkActivation,
    };

    const emailTemplate = await ejs.renderFile(pathFile, params);

    await emailSender({
      emailAddressToSend: user.email,
      emailSubject: req.t("emails.password-reset.subject"),
      emailBody: emailTemplate,
    }).catch(error => {
      user.deleteOne();
      throw error;
    });
  }

  return true;
};

userSchema.statics.verifyResetPassword = async function (attributes, req) {
  const Token = require("./token");

  const { token, userId, password } = attributes;

  const passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    const errorsObjects = [
      {
        source: {
          pointer: "password-reset-token-expired",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_token_expired.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_token_expired.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_password_token_incorrect,
      errorsObjects
    );
  }

  const isValid = await bcryptjs.compare(token, passwordResetToken.token);

  if (!isValid) {
    const errorsObjects = [
      {
        source: {
          pointer: "password-reset-token-expired",
        },
        title: req.t(
          "services.users_services.get_user_authentication.user_token_expired.title"
        ),
        detail: req.t(
          "services.users_services.get_user_authentication.user_token_expired.detail"
        ),
      },
    ];
    throw new ErrorResponseParser(
      ResponsesTypes.errors.errors_400.error_password_token_incorrect,
      errorsObjects
    );
  }

  const passwordHashed = await bcryptjs.hash(password, 12);

  await this.updateOne({ _id: userId }, { $set: { password: passwordHashed } });

  await passwordResetToken.deleteOne();
  return true;
};

//RELATIONSHIPS

//** Related
userSchema.statics.findProductsByUser = async function (userId, query) {
  const Product = require("./product");
  const queryBuider = new QueryBuilder(Product, query);
  const { countDocuments: totalProducts, documents: products } =
    await queryBuider.getCollections({
      creators: ObjectId(userId),
    });
  return { totalProducts, products };
};
module.exports = mongoose.model("User", userSchema);
