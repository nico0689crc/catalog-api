const supertest = require("supertest");
const { Category, User } = require("../src/models");
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

let user_registered_admin;
let user_registered_admin_second;
let user_registered_user;
let category_created_admin;
let category_created_admin_second;

const getUserData = (
  name = "Nicolas Admin",
  email = "admincategory@gmail.com",
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

const registerUser = async (name, email, password, role = "user") => {
  return await api
    .post("/api/users/registration")
    .send(getUserData(name, email, password, role))
    .then(response => response.body.data);
};

const getCategoryData = (
  name = "Category Name",
  description = "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain."
) => {
  return {
    data: {
      type: "catogories",
      attributes: {
        name: name,
        description: description,
      },
    },
  };
};

beforeAll(async () => {
  await databaseConfig.connect(() => {}, true);
  await Category.deleteMany({});
  await User.deleteMany({});

  user_registered_admin_second = await registerUser(
    "Nicolas Admin Second",
    "admin_second_category@gmail.com",
    "123456",
    "admin"
  );

  user_registered_admin = await registerUser(
    "Nicolas Admin",
    "admin_category@gmail.com",
    "123456",
    "admin"
  );

  user_registered_user = await registerUser(
    "Nicolas User",
    "user_category@gmail.com",
    "123456"
  );

  category_created_admin = await Category.create({
    name: "Category Example",
    description:
      "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.",
    creators: user_registered_admin.id,
    slug: "test_teste_test_test",
  });

  category_created_admin_second = await Category.create({
    name: "Category Example Second",
    description:
      "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.",
    creators: user_registered_admin_second.id,
    slug: "test_teste_test_test",
  });
});

if (testToRun.create) {
  describe("Category Create", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .post("/api/categories")
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "/api/categories",
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
        .post("/api/categories")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "/api/categories",
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 201 (CAtegory Created) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/categories")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "categories",
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: expect.any(String),
                description: expect.any(String),
                images: expect.any(String),
                slug: expect.any(String),
              }),
            })
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/categories")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(
          getCategoryData(
            "",
            "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit"
          )
        )
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.name",
                }),
                title: "Invalid Attribute",
                detail: "Category name must be at least 10 characters long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/categories")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getCategoryData("Why do we use it?", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.description",
                }),
                title: "Invalid Attribute",
                detail:
                  "Category description must be at least 30 characters long.",
              }),
            ])
          );
        });
    });
  });
}

if (testToRun.getOne) {
  describe("Category Get One", () => {
    test("Category Get One Test Routing", async () => {
      await api
        .get(`/api/categories/${category_created_admin._id.toString()}`)
        .then(response => {
          console.log(response.body);
          expect(response.status).toBe(200);
        });
    });
  });
}

if (testToRun.getMany) {
  describe("Category Get Many", () => {
    test("Category Get Many Test Routing", async () => {
      await api.get("/api/categories").then(response => {
        console.log(response.body);
        expect(response.status).toBe(200);
      });
    });
  });
}

if (testToRun.update) {
  describe("Category Update", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/${category_created_admin._id.toString()}`,
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
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/${category_created_admin._id.toString()}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(
          getCategoryData(
            "",
            "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit"
          )
        )
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.name",
                }),
                title: "Invalid Attribute",
                detail: "Category name must be at least 10 characters long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getCategoryData("Why do we use it?", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.description",
                }),
                title: "Invalid Attribute",
                detail:
                  "Category description must be at least 30 characters long.",
              }),
            ])
          );
        });
    });

    test("Status Code 404 (Category Not Found) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/categories/61ba71ef2ee23db228109669`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getCategoryData())
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/61ba71ef2ee23db228109669`,
                }),
                title: "Resource not found.",
                detail: "The requested resource could not be retrieved.",
              }),
            ])
          );
        });
    });

    test("Status Code 200 (Category Updated) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(
          getCategoryData(
            "Category Name Updated",
            "Category Description Updated Category Description Updated Category Description Updated"
          )
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "categories",
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: expect.any(String),
                description: expect.any(String),
                images: expect.any(String),
                slug: expect.any(String),
              }),
            })
          );
        });
    });

    test("Status Code 200 (Category Updated) Updating Category created by other admin - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin_second.attributes.token}`
        )
        .send(
          getCategoryData(
            "Category Name Updated Second",
            "Category Second Description Updated Category Second Description Updated Category Second Description Updated"
          )
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(
            expect.objectContaining({
              type: "categories",
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: expect.any(String),
                description: expect.any(String),
                images: expect.any(String),
                slug: expect.any(String),
              }),
            })
          );
        });
    });
  });
}

if (testToRun.delete) {
  describe("Category Delete", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .delete(`/api/categories/${category_created_admin._id.toString()}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/${category_created_admin._id.toString()}`,
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
        .delete(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/${category_created_admin._id.toString()}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 404 (category Not Found) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/categories/61ba71ef2ee23db228109669`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/categories/61ba71ef2ee23db228109669`,
                }),
                title: "Resource not found.",
                detail: "The requested resource could not be retrieved.",
              }),
            ])
          );
        });
    });

    test("Status Code 204 (category Deleted) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/categories/${category_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .then(response => {
          expect(response.status).toBe(204);
        });
    });

    test("Status Code 204 (category Deleted) Deleting category created by other admin - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(
          `/api/categories/${category_created_admin_second._id.toString()}`
        )
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin_second.attributes.token}`
        )
        .then(response => {
          expect(response.status).toBe(204);
        });
    });
  });
}
