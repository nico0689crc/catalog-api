const supertest = require("supertest");
const { Comment, User, Product } = require("../src/models");
const app = require("../src/app");
const { databaseConfig } = require("../src/config");

const api = supertest(app);

const testToRun = {
  create: true,
  getOne: true,
  getMany: true,
  update: true,
  delete: true,
};

let user_admin_1;
let user_admin_2;
let user_user_1;
let user_user_2;
let product_user_1;
let product_admin_1;
let comment_admin_1;
let comment_admin_2;
let comment_user_1;
let comment_user_2;

const getUserData = (
  name = "Nicolas Admin",
  email = "admin_comment@gmail.com",
  password = "123456",
  role = "user"
) => {
  return {
    data: {
      type: "users",
      attributes: {
        name: name,
        email: email,
        password: password,
        role,
      },
    },
  };
};

const getProductData = (
  name = "Producto de Ejemplo para testing.",
  description = "Producto de Ejemplo para testing. Producto de Ejemplo para testing. Producto de Ejemplo para testing."
) => {
  return {
    data: {
      type: "products",
      attributes: {
        name: name,
        description: description,
        quantity: "10",
        price: "5.5",
      },
    },
  };
};

const getCommentData = (
  product_id,
  body = "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source."
) => {
  return {
    data: {
      type: "products",
      attributes: {
        product_id: product_id,
        body: body,
      },
    },
  };
};

const createUser = async (name, email, password, role) => {
  const result = await api
    .post("/api/users/registration")
    .send(getUserData(name, email, password, role))
    .then(response => response.body.data);
  return result;
};

const createProduct = async (token, productName, productDescription) => {
  const result = await api
    .post("/api/products")
    .set("Content-Type", "application/json")
    .set("Authorization", `Barrer ${token}`)
    .send(getProductData(productName, productDescription))
    .then(response => response.body.data);
  return result;
};

const createDataToTest = async () => {
  user_admin_1 = await createUser(
    "nico_comment_admin_1",
    "nico_comment_admin_1@gmail.com",
    "123456",
    "admin"
  );

  user_admin_2 = await createUser(
    "nico_comment_admin_2",
    "nico_comment_admin_2@gmail.com",
    "123456",
    "admin"
  );

  user_user_1 = await createUser(
    "nico_comment_user_1",
    "nico_comment_user_1@gmail.com",
    "123456",
    "user"
  );

  user_user_2 = await createUser(
    "nico_comment_user_2",
    "nico_comment_user_2@gmail.com",
    "123456",
    "user"
  );

  product_user_1 = await createProduct(
    user_user_1.attributes.token,
    "The standard Lorem Ipsum passage, used since the 1500s",
    "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
  );

  product_admin_1 = await createProduct(
    user_admin_1.attributes.token,
    "The standard Lorem Ipsum passage, used since the 1500s",
    "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
  );

  comment_admin_1 = await Comment.create({
    body: "Comment Admin 1 - There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    creators: user_admin_1.id,
    product: product_user_1.id,
  });

  comment_admin_2 = await Comment.create({
    body: "Comment Admin 2 - There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    creators: user_admin_2.id,
    product: product_admin_1.id,
  });

  comment_user_1 = await Comment.create({
    body: "Comment User 1 - There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    creators: user_user_1.id,
    product: product_user_1.id,
  });

  comment_user_2 = await Comment.create({
    body: "Comment User 2 - There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    creators: user_user_2.id,
    product: product_admin_1.id,
  });
};

beforeAll(async () => {
  await databaseConfig.connect(() => {}, true);
  await User.deleteMany({});
  await Product.deleteMany({});
  await Comment.deleteMany({});

  await createDataToTest();
}, 10000);

if (testToRun.create) {
  describe("Comment Create", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .post("/api/comments")
        .send(getCommentData(product_user_1.id))
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "/api/comments",
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/comments")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .send(getCommentData(product_user_1.id, ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.body",
                }),
                title: "Invalid Attribute",
                detail: "Comment should not be empty.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error - Producto Not Found) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/comments")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(getCommentData("61bbb73af68fc22d18d5e5cf", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.product_id",
                }),
                title: "Invalid Attribute",
                detail:
                  "The product you are trying to comment on is not found at this time.",
              }),
            ])
          );
        });
    });

    test("Status Code 201 (Comment Created) - Token OK - Authorization OK (User)", async () => {
      await api
        .post("/api/comments")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .send(
          getCommentData(
            product_admin_1.id,
            "In the example above, when the password field is shorter than 5 characters, or doesn't contain a number, it will be reported with the message The password must be 5+ chars long and contain a number, as these validators didn't specify a message of their own."
          )
        )
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "comments",
              id: expect.any(String),
              attributes: expect.objectContaining({
                body: expect.any(String),
              }),
            })
          );
        });
    });

    test("Status Code 201 (Comment Created) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/comments")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(
          getCommentData(
            product_user_1.id,
            "In the example above, when the password field is shorter than 5 characters, or doesn't contain a number, it will be reported with the message The password must be 5+ chars long and contain a number, as these validators didn't specify a message of their own."
          )
        )
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "comments",
              id: expect.any(String),
              attributes: expect.objectContaining({
                body: expect.any(String),
              }),
            })
          );
        });
    });
  });
}

if (testToRun.getOne) {
  describe("Comment Get One", () => {
    test("Comment Get One Test Routing", async () => {
      await api.get(`/api/comments/${comment_user_1._id}`).then(response => {
        expect(response.status).toBe(200);
      });
    });
  });
}

if (testToRun.getMany) {
  describe("Comment Get Many", () => {
    test("Comment Get Many Test Routing", async () => {
      await api.get("/api/comments").then(response => {
        expect(response.status).toBe(200);
      });
    });
  });
}

if (testToRun.update) {
  describe("Comment Update", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .patch(`/api/comments/`)
        .set("Content-Type", "application/json")
        .send(
          getCommentData("", "Comment Updated: In the a message of their own.")
        )
        .then(response => {
          expect(response.status).toBe(404);
        });
    });

    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .patch(`/api/comments/${comment_admin_1.id}`)
        .set("Content-Type", "application/json")
        //.set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(
          getCommentData("", "Comment Updated: In the a message of their own.")
        )
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_admin_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 403 (Unauthorized) - Token OK - Authorization NOT (User)", async () => {
      await api
        .patch(`/api/comments/${comment_admin_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .send(
          getCommentData("", "Comment Updated: In the a message of their own.")
        )
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_admin_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 403 (Unauthorized) - Token OK - Authorization NOT (User)", async () => {
      await api
        .patch(`/api/comments/${comment_user_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_2.attributes.token}`)
        .send(
          getCommentData("", "Comment Updated: In the a message of their own.")
        )
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_user_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/comments/${comment_user_2.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(getCommentData("", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.body",
                }),
                title: "Invalid Attribute",
                detail: "Comment should not be empty.",
              }),
            ])
          );
        });
    });

    test("Status Code 200 (Comment Updated) - Token OK - Authorization OK (User)", async () => {
      await api
        .patch(`/api/comments/${comment_user_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .send(
          getCommentData("", "Comment 2 Updated: In the a message of thwn.")
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "comments",
              id: expect.any(String),
              attributes: expect.objectContaining({
                body: expect.any(String),
              }),
            })
          );
        });
    });

    test("Status Code 200 (Comment Updated) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/comments/${comment_user_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(getCommentData("", "Comment Updated: In the a message of thwn."))
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "comments",
              id: expect.any(String),
              attributes: expect.objectContaining({
                body: expect.any(String),
              }),
            })
          );
        });
    });

    test("Status Code 200 (Comment Updated) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/comments/${comment_admin_2.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .send(getCommentData("", "Comment Updated: In the a message of thwn."))
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "comments",
              id: expect.any(String),
              attributes: expect.objectContaining({
                body: expect.any(String),
              }),
            })
          );
        });
    });
  });
}

if (testToRun.delete) {
  describe("Comment Delete", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .delete(`/api/comments/${comment_admin_1.id}`)
        .set("Content-Type", "application/json")
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_admin_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 403 (Unauthorized) - Token OK - Authorization NOT (User)", async () => {
      await api
        .delete(`/api/comments/${comment_admin_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_admin_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 403 (Unauthorized) - Token OK - Authorization NOT (User)", async () => {
      await api
        .delete(`/api/comments/${comment_user_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_2.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/comments/${comment_user_1.id}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 204 (Comment Deleted) - Token OK - Authorization OK (User)", async () => {
      await api
        .delete(`/api/comments/${comment_user_1.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_user_1.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    });

    test("Status Code 204 (Comment Deleted) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/comments/${comment_user_2.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    });

    test("Status Code 204 (Comment Deleted) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/comments/${comment_admin_2.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_admin_1.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    });
  });
}
