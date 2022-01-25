const supertest = require("supertest");
const app = require("../src/app");
const { createResourcesProductTestInit } = require("./CreateResources");
const api = supertest(app);

let usersCreated;
const recreateDb = true;
const testToRun = {
  register: false,
  authentication: false,
  getOne: false,
  getMany: true,
  update: false,
  delete: false,
};

const getUserData = ({ name, email, password, role }) => {
  const emailValue = email || "admin@gmail.com";
  const nameValue = name || "Nicolas Admin";
  const passwordValue = password || "123456";
  const roleValue = role || "user";

  return {
    data: {
      type: "users",
      attributes: {
        name: nameValue,
        email: emailValue,
        password: passwordValue,
        role: roleValue,
      },
    },
  };
};

beforeAll(async () => {
  const results = await createResourcesProductTestInit(recreateDb, true);
  usersCreated = results.usersCreated;
}, 30000);

if (testToRun.register) {
  describe("User Registration", () => {
    test("Http Status Code 400 (Input Validation Error). Token NOT and Permission OK (Anonymous User)", async () => {
      await api
        .post("/api/users/registration")
        .send(getUserData({ name: "", email: "", password: "" }))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: expect.any(String),
                }),
                title: expect.any(String),
                detail: expect.objectContaining({}),
              }),
            ])
          );
        });
    });

    test("Http Status Code 400 (Input Validation Error - Email already used). Token NOT and Permission OK (Anonymous User)", async () => {
      await await api
        .post("/api/users/registration")
        .send(
          getUserData({
            email: "dobvikes@kuedi.mv",
            name: "Nicolas F",
            password: "123456",
          })
        )
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  pointer: "data.attributes.email",
                }),
                title: "Invalid Attribute",
                detail: expect.any(String),
              }),
            ])
          );
        });
    });

    test("Http Status Code 201 (User Registered). Token NOT and Permission OK (Anonymous User)", async () => {
      await api
        .post("/api/users/registration")
        .send(
          getUserData({
            email: "dobvikes1@kuedi.mv",
            name: "Nicolas F",
            password: "123456",
          })
        )
        .then(response => {
          expect(response.status).toEqual(201);
        });
    });

    test("Http Status Code 201 (User Registered).", async () => {
      await api
        .post("/api/users/registration")
        .send(
          getUserData({
            email: "dobvikes1@kuedi.mv",
            name: "Nicolas F",
            password: "123456",
          })
        )
        .then(response => {
          expect(response.status).toEqual(201);
        });
    });
  });
}

if (testToRun.authentication) {
  describe("User Authentication", () => {
    test("Status Code 400 - (Input Validation Error). Token NOT and Permission NOT (Anonymous User)", async () => {
      await api
        .post("/api/users/authentication")
        .send(
          getUserData({
            name: "",
            email: "aasd",
            password: "asdas",
          })
        )
        .then(response => {
          expect(response.status).toBe(400);
        });
    });

    test("Status Code 404 - (Wrong Credentials - EMAIL)", async () => {
      await api
        .post("/api/users/authentication")
        .send(
          getUserData({
            name: "",
            email: "nico2222@gmail.com",
            password: "123456",
          })
        )
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual([
            {
              source: {
                pointer: "data/attributes/email",
              },
              title: "Credentia Incorrect.",
              detail: "User login credentials are incorrect",
            },
          ]);
        });
    });

    test("Status Code 404 - (Wrong Credentials - PASSWORD.)", async () => {
      await api
        .post("/api/users/authentication")
        .send(
          getUserData({
            name: "",
            email: "dobvikes@kuedi.mv",
            password: "12354654564564",
          })
        )
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual([
            {
              source: {
                pointer: "data/attributes/password",
              },
              title: "Credentia Incorrect.",
              detail: "User login credentials are incorrect",
            },
          ]);
        });
    });

    test("Status Code 200 - (User Authenticated)", async () => {
      await api
        .post("/api/users/authentication")
        .send(getUserData({}))
        .then(response => {
          expect(response.status).toBe(200);
        });
    });
  });
}

if (testToRun.getOne) {
  describe("User Get One", () => {
    test("Http Status Code 400 - User Not Found", async () => {
      await api.get("/api/users/61b15e4899c781d9508c8c13").then(response => {
        expect(response.status).toBe(404);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              source: expect.objectContaining({}),
              title: "Resource not found.",
              detail: "The requested resource could not be retrieved.",
            }),
          ])
        );
      });
    });

    test("It should 200 if the user was found and its properties.", async () => {
      await api
        .get(
          `/api/users/${usersCreated[1]._id}?include=products&fields%5Busers%5D=name,email&fields%5Bproducts%5D=name,description`
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data.attributes).toEqual(
            expect.not.objectContaining({
              avatar: expect.any(String),
            })
          );
          expect(response.body.included).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "products",
                attributes: expect.not.objectContaining({
                  price: expect.any(String),
                  images: expect.any(String),
                  quantity: expect.any(String),
                  price_sale: expect.any(String),
                }),
              }),
            ])
          );
        });
    });
  });
}

if (testToRun.getMany) {
  describe("User Get Many", () => {
    test("Status Code 200 - Users Get Many Test Routing", async () => {
      await api.get("/api/users").then(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            links: expect.objectContaining({}),
            data: expect.arrayContaining([
              expect.objectContaining({
                type: "users",
                attributes: expect.objectContaining({}),
                relationships: expect.objectContaining({}),
                links: expect.objectContaining({
                  self: expect.any(String),
                }),
              }),
            ]),
          })
        );
      });
    });

    test("Status Code 200 - Pagination Page 1 by 5 elements", async () => {
      await api
        .get("/api/users?page%5Bnumber%5D=1&page%5Bsize%5D=5")
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(5);
        });
    });

    test("Status Code 200 - INCLUDE Products,Tags PAGINATION 1 page", async () => {
      await api
        .get("/api/users?page%5Bnumber%5D=1&page%5Bsize%5D=5&include=products")
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(5);
          expect(response.body.included).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "products",
                attributes: expect.objectContaining({}),
              }),
            ])
          );
        });
    });

    test("Status Code 200 - INCLUDE products PAGINATION 1 page FIELDS products[name,description,quantity]", async () => {
      await api
        .get(
          "/api/users?page%5Bnumber%5D=1&page%5Bsize%5D=5&include=products&fields%5Bproducts%5D=name,description,quantity"
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(5);

          expect(response.body.data.attributes).toEqual(
            expect.not.objectContaining({
              price: expect.any(String),
              active: expect.any(String),
              discount: expect.any(String),
            })
          );

          expect(response.body.included).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "products",
                attributes: expect.not.objectContaining({
                  price_sale: expect.any(String),
                  slug: expect.any(String),
                }),
              }),
            ])
          );
        });
    });
  });
}

if (testToRun.update) {
  describe("User Update", () => {
    test("Status Code 400 - (Invalid Token). Token Invalid", async () => {
      await api
        .patch(`/api/users/${usersCreated[1]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[3].token}55485`)
        .send(getUserData({}))
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual([
            {
              source: {
                pointer: `/api/users/${usersCreated[1]._id}`,
              },
              title: "Unauthorizated.",
              detail:
                "The request is trying to perform an unauthorizated action.",
            },
          ]);
        });
    });

    test("Status Code 400 - (Input Validation Error). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/users/${usersCreated[0]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[3].token}`)
        .send(getUserData({ name: "asd", email: "asdasd" }))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual([
            {
              source: { location: "body", pointer: "data.attributes.name" },
              title: "Invalid Attribute",
              detail: "Must be at least 6 chars long",
            },
            {
              source: { location: "body", pointer: "data.attributes.email" },
              title: "Invalid Attribute",
              detail: "Must be e-mail format",
            },
          ]);
        });
    });

    test("Status Code 400 - (Input Validation - Email Used). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/users/${usersCreated[3]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[5].token}`)
        .send(getUserData({ name: "Nicolas F Updated", email: "sat@kono.vg" }))
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual([
            {
              source: { location: "body", pointer: "data.attributes.email" },
              title: "Invalid Attribute",
              detail:
                "There is an account register already with this e-mail address.",
            },
          ]);
        });
    });

    test("Status Code 404 - (User Not Found). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/users/61b7a4a0d53967417f0fb0f9`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[4].token}`)
        .send(getUserData({}))
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.body.errors).toEqual([
            {
              source: { pointer: "/api/users/61b7a4a0d53967417f0fb0f9" },
              title: "Resource not found.",
              detail: "The requested resource could not be retrieved.",
            },
          ]);
        });
    });

    test("Status Code 403 - (User Without Authorization). Token OK and Permission NOT", async () => {
      await api
        .patch(`/api/users/${usersCreated[4]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[1].token}`)
        .send(getUserData({}))
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.errors).toEqual([
            {
              source: { pointer: `/api/users/${usersCreated[4]._id}` },
              title: "Unauthorizated.",
              detail:
                "The request is trying to perform an unauthorizated action.",
            },
          ]);
        });
    });

    test("Status Code 200 - (User Updated). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/users/${usersCreated[1]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[4].token}`)
        .send(
          getUserData({
            name: "Nicolas Admin Updated",
            email: "admin_updated@gmail.com",
          })
        )
        .then(response => {
          expect(response.status).toBe(200);
        });
    });
  });
}

if (testToRun.delete) {
  describe("User Delete", () => {
    test("Status Code 403 - (Invalid Token). Token Invalid", async () => {
      await api
        .delete(`/api/users/${usersCreated[1]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[1].token}55485`)
        .then(response => {
          expect(response.status).toBe(403);
        });
    });

    test("Status Code 404 - (User Not Found). Token OK and Permission OK", async () => {
      await api
        .delete(`/api/users/61b15e4899c781d9508c8c13`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[5].token}`)
        .then(response => {
          expect(response.status).toBe(404);
        });
    });

    test("Status Code 403 - (User Without Authorization). Token OK and Permission NOT", async () => {
      await api
        .delete(`/api/users/${usersCreated[4]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[1].token}`)
        .then(response => {
          expect(response.status).toBe(403);
        });
    });

    test("Status Code 204 - (User Deleted). Token OK and Permission OK", async () => {
      await api
        .delete(`/api/users/${usersCreated[6]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[4].token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    });
  });
}
