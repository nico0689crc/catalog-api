const supertest = require("supertest");
const { Tag, User } = require("../src/models");
const app = require("../src/app");
const { databaseConfig } = require("../src/config");

const api = supertest(app);

const testToRun = {
  create: true,
  getOne: false,
  getMany: false,
  update: true,
  delete: true,
};

let user_registered_admin;
let user_registered_admin_second;
let user_registered_user;
let tag_created_admin;
let tag_created_admin_second;

const getUserData = (
  name = "Nicolas Admin",
  email = "admintags@gmail.com",
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

const getTagData = (name = "Tag Name", slug = "tag_slug") => {
  return {
    data: {
      type: "tags",
      attributes: {
        name: name,
        slug: slug,
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

beforeAll(async () => {
  await databaseConfig.connect(() => {}, true);
  await Tag.deleteMany({});
  await User.deleteMany({});

  user_registered_admin_second = await registerUser(
    "Nicolas Admin Second",
    "adminsecondtags@gmail.com",
    "123456",
    "admin"
  );

  user_registered_admin = await registerUser(
    "Nicolas Admin",
    "admintags@gmail.com",
    "123456",
    "admin"
  );

  user_registered_user = await registerUser(
    "Nicolas User",
    "usertags@gmail.com",
    "123456"
  );

  tag_created_admin = await Tag.create({
    name: "Tag Example",
    slug: "tag_example",
    creators: user_registered_admin.id,
  });

  tag_created_admin_second = await Tag.create({
    name: "Tag Example Second",
    slug: "tag_example Second",
    creators: user_registered_admin_second.id,
  });
});

if (testToRun.create) {
  describe("Tag Create", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .post("/api/tags")
        .send(getTagData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "/api/tags",
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
        .post("/api/tags")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .send(getTagData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "/api/tags",
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 201 (Tag Created) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/tags")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData())
        .then(response => {
          expect(response.status).toBe(201);
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/tags")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("", "slung_test"))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.name",
                }),
                title: "Invalid Attribute",
                detail: "Must be at least 4 chars long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/tags")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("Tag Name", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.slug",
                }),
                title: "Invalid Attribute",
                detail: "Must be at least 4 chars long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error - Slug already used) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .post("/api/tags")
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData())
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.slug",
                }),
                title: "Invalid Attribute",
                detail: "This slug is used already.",
              }),
            ])
          );
        });
    });
  });
}

if (testToRun.getOne) {
  describe("Tag Get One", () => {
    test("It should return 404 if tagId parameter is not ObjectId MongoDb.", async () => {
      await api.get("/api/tags/1234").then(response => {
        expect(response.status).toBe(404);
        expect(response.body.error).toHaveProperty(
          "name",
          "resource_not_found"
        );
      });
    });
  });
}

if (testToRun.getMany) {
  describe("Tag Get Many", () => {
    test("It should 200 if the user was found and its properties.", async () => {
      await api.get(`/api/tags`).then(response => {
        expect(response.status).toBe(200);
      });
    });
  });
}

if (testToRun.update) {
  describe("Tag Update", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .send(getTagData("Tag Updated", "tag_updated"))
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/tags/${tag_created_admin._id.toString()}`,
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
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .send(getTagData())
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/tags/${tag_created_admin._id.toString()}`,
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
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("", "slung_test"))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.name",
                }),
                title: "Invalid Attribute",
                detail: "Must be at least 4 chars long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error ) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("Tag Name", ""))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.slug",
                }),
                title: "Invalid Attribute",
                detail: "Must be at least 4 chars long.",
              }),
            ])
          );
        });
    });

    test("Status Code 400 (Input Validation Error - Slug already used) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("Tax Example", "tag_example"))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.slug",
                }),
                title: "Invalid Attribute",
                detail: "This slug is used already.",
              }),
            ])
          );
        });
    });

    test("Status Code 404 (Tag Not Found) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/tags/61ba71ef2ee23db228109669`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("Tag Updated", "tag_updated"))
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/tags/61ba71ef2ee23db228109669`,
                }),
                title: "Resource not found.",
                detail: "The requested resource could not be retrieved.",
              }),
            ])
          );
        });
    });

    test("Status Code 200 (Tag Updated) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .send(getTagData("Tag Updated", "tag_updated"))
        .then(response => {
          expect(response.status).toBe(200);
        });
    });

    test("Status Code 200 (Tag Updated) Updating Tag created by other admin - Token OK - Authorization OK (Admin)", async () => {
      await api
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin_second.attributes.token}`
        )
        .send(getTagData("Tag Updated Second", "tag_updated_second"))
        .then(response => {
          expect(response.status).toBe(200);
        });
    });
  });
}

if (testToRun.delete) {
  describe("Tag Delete", () => {
    test("Status Code 403 (Unauthorized) - Token NOT (Anonymous)", async () => {
      await api
        .delete(`/api/tags/${tag_created_admin._id.toString()}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/tags/${tag_created_admin._id.toString()}`,
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
        .patch(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${user_registered_user.attributes.token}`)
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: `/api/tags/${tag_created_admin._id.toString()}`,
                }),
                title: "Unauthorizated.",
                detail:
                  "The request is trying to perform an unauthorizated action.",
              }),
            ])
          );
        });
    });

    test("Status Code 404 (Tag Not Found) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/tags/61ba71ef2ee23db228109669`)
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
                  pointer: `/api/tags/61ba71ef2ee23db228109669`,
                }),
                title: "Resource not found.",
                detail: "The requested resource could not be retrieved.",
              }),
            ])
          );
        });
    });

    test("Status Code 204 (Tag Deleted) - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/tags/${tag_created_admin._id.toString()}`)
        .set("Content-Type", "application/json")
        .set(
          "Authorization",
          `Barrer ${user_registered_admin.attributes.token}`
        )
        .then(response => {
          expect(response.status).toBe(204);
        });
    });

    test("Status Code 204 (Tag Deleted) Deleting Tag created by other admin - Token OK - Authorization OK (Admin)", async () => {
      await api
        .delete(`/api/tags/${tag_created_admin_second._id.toString()}`)
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
