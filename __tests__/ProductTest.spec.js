const supertest = require("supertest");
const app = require("../src/app");
const { createResourcesProductTestInit } = require("./CreateResources");
const api = supertest(app);

let usersCreated, productsCreated, tagsCreated, categoriesCreated;
const recreateDb = true;
const TIME_OUT = 30000;

const testToRun = {
  create: true,
  getOne: true,
  getMany: true,
  update: true,
  delete: true,
};

const getProductData = (
  name = "Producto de Ejemplo para testing.",
  description = "Producto de Ejemplo para testing. Producto de Ejemplo para testing. Producto de Ejemplo para testing.",
  tags = [tagsCreated[0]._id, tagsCreated[2]._id, tagsCreated[3]._id],
  categories = categoriesCreated[0]._id
) => {
  return {
    data: {
      type: "products",
      attributes: {
        name: name,
        description: description,
        quantity: "10",
        price: "5.5",
        tags: tags,
        categories: categories,
      },
    },
  };
};

beforeAll(async () => {
  const results = await createResourcesProductTestInit(recreateDb, true);
  usersCreated = results.usersCreated;
  productsCreated = results.productsCreated;
  tagsCreated = results.tagsCreated;
  categoriesCreated = results.categoriesCreated;
}, TIME_OUT);

if (testToRun.create) {
  describe("Product Create", () => {
    test("It should return 403 when is tried to create a product without a valid token", async () => {
      await api
        .post("/api/products")
        .set("Content-Type", "application/json")
        .send(getProductData())
        .then(response => {
          expect(response.status).toBe(403);
        });
    });

    test("It should return 403 when is tried to create a product with an invalid token", async () => {
      await api
        .post("/api/products")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}aaa`)
        .send(getProductData())
        .then(response => {
          expect(response.status).toBe(403);
        });
    });

    test("It should return 400(Input Validation Error) - This user: Token OK and Permission OK", async () => {
      await api
        .post("/api/products")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .send(getProductData("Pro", "Prrooo"))
        .then(response => {
          expect(response.status).toBe(400);
        });
    });

    test("It should return 201(Resource created) - Token: OK - Permission(Admin): OK", async () => {
      await api
        .post("/api/products")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[3].token}`)
        .send(getProductData())
        .then(response => {
          expect(response.status).toBe(201);
        });
    });

    test("It should return 201(Resource created) - Token: OK - Permission(User): OK", async () => {
      await api
        .post("/api/products")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .send(getProductData())
        .then(response => {
          expect(response.status).toBe(201);
        });
    });

    test("It should return 201(Resource created) - Response structure Ok", async () => {
      await api
        .post("/api/products?include=categories,tags")
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .send(
          getProductData(
            "Esse duis mollit sint pariatur labore aliqua occaecat Lorem Lorem nulla ad dolor pariatur.",
            "Nostrud minim sunt duis est. Consectetur occaecat consequat do adipisicing deserunt anim veniam. Exercitation adipisicing est proident pariatur incididunt incididunt nulla mollit dolor fugiat. In dolore do anim enim nulla culpa elit amet sunt elit.",
            [tagsCreated[2]._id, tagsCreated[1]._id],
            categoriesCreated[2]._id
          )
        )
        .then(response => {
          expect(response.status).toBe(201);
        });
    });
  });
}

if (testToRun.getOne) {
  describe("Product Get One", () => {
    test("Status Code 200 - Without query", async () => {
      await api
        .get(`/api/products/${productsCreated[5]._id}`)
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(
            expect.objectContaining({
              links: expect.objectContaining({
                self: `http://localhost:3300/api/products/${productsCreated[5]._id}`,
              }),
              data: expect.objectContaining({
                attributes: expect.objectContaining({}),
                relationships: expect.objectContaining({
                  tags: expect.objectContaining({}),
                  comments: expect.objectContaining({}),
                  categories: expect.objectContaining({}),
                  creators: expect.objectContaining({}),
                }),
                type: "products",
              }),
            })
          );
        });
    });

    test("Status Code 200 - Get a Product with the INCLUDED Creators,Categories,Tags", async () => {
      await api
        .get(
          `/api/products/${productsCreated[5]._id}?include=creators,categories,tags`
        )
        .then(response => {
          expect(response.status).toBe(200);
        });
    });

    test("Status Code 200 - Get a Product with FIELDS name, description, price", async () => {
      await api
        .get(
          `/api/products/${productsCreated[5]._id}?fields%5Bproducts%5D=name,description,price`
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data.attributes).toMatchObject({
            name: productsCreated[5].name,
            description: productsCreated[5].description,
            price: productsCreated[5].price,
          });
        });
    });

    test("Status Code 200 - Get a Product with INCLUDED Categories FIELDS name, description", async () => {
      await api
        .get(
          `/api/products/${productsCreated[5]._id}?include=categories&fields%categories%5D=name,description,slug`
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.included[0]).toMatchObject({
            type: "categories",
            id: categoriesCreated[2]._id,
            attributes: {
              name: categoriesCreated[2].name,
              description: categoriesCreated[2].description,
              slug: categoriesCreated[2].slug,
            },
            links: {
              self: `http://localhost:3300/api/categories/${categoriesCreated[2]._id}`,
            },
          });
        });
    });
  });
}

if (testToRun.getMany) {
  describe("Product Get Many", () => {
    test("Status Code 200 - Product Get Many Test Routing", async () => {
      await api.get("/api/products").then(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            links: expect.objectContaining({}),
            data: expect.arrayContaining([
              expect.objectContaining({
                type: "products",
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
        .get("/api/products?page%5Bnumber%5D=1&page%5Bsize%5D=5")
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(5);
        });
    });

    test("Status Code 200 - INCLUDE Categories,Tags PAGINATION 1 page", async () => {
      await api
        .get(
          "/api/products?page%5Bnumber%5D=1&page%5Bsize%5D=5&include=categories,tags"
        )
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(5);
          expect(response.body.included).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "categories",
                attributes: expect.objectContaining({}),
              }),
              expect.objectContaining({
                type: "tags",
                attributes: expect.objectContaining({}),
              }),
            ])
          );
        });
    });

    test("Status Code 200 - INCLUDE Categories,Tags PAGINATION 1 page FIELDS products[name,description,quantity] categories[name,description]", async () => {
      await api
        .get(
          "/api/products?page%5Bnumber%5D=1&page%5Bsize%5D=5&include=categories,tags&fields%5Bproducts%5D=name,description,quantity&fields%5Bcategories%5D=name,description"
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
                type: "categories",
                attributes: expect.not.objectContaining({
                  icon: expect.any(String),
                  slug: expect.any(String),
                }),
              }),
              expect.objectContaining({
                type: "tags",
                attributes: expect.objectContaining({}),
              }),
            ])
          );
        });
    });
  });
}

if (testToRun.update) {
  describe("Product Update", () => {
    test("It should return 403 (Unauthorized).. Token: NOT", async () => {
      await api
        .patch(`/api/products/${productsCreated[0]._id}`)
        .send(getProductData())
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 403 (Unauthorized).. Token: WRONG", async () => {
      await api
        .patch(`/api/products/${productsCreated[0]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}aaa`)
        .send(
          getProductData(
            "Producto Updated Producto Updated Producto Updated",
            "Producto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto Updated"
          )
        )
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 403 (Unauthorized).. Token: OK and Permission: NOT", async () => {
      await api
        .patch(`/api/products/${productsCreated[5]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .send(
          getProductData(
            "Producto Updated Producto Updated Producto Updated",
            "Producto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto UpdatedProducto Updated"
          )
        )
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 200 (Resourse Updated). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/products/${productsCreated[5]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[5].token}`)
        .send(
          getProductData(
            "Product Updated From Api",
            "Product Updated From Api - It should return 200 (Resourse Updated). Token OK and Permission OK",
            [tagsCreated[0]._id, tagsCreated[5]._id],
            categoriesCreated[2]._id
          )
        )
        .then(response => {
          expect(response.status).toBe(200);
        });
    }, 10000);

    test("It should return 400 (Input Validation Error). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/products/${productsCreated[1]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[5].token}`)
        .send(getProductData("Produ", "Produ"))
        .then(response => {
          expect(response.status).toBe(400);
        });
    }, 10000);

    test("It should return 200 (Resourse Updated). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/products/${productsCreated[0]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .send(
          getProductData(
            "Product Updated From Api",
            "It should return 200 (Resourse Updated). Token OK and Permission OK",
            [tagsCreated[1]._id, tagsCreated[3]._id, tagsCreated[6]._id],
            categoriesCreated[2]._id
          )
        )
        .then(response => {
          expect(response.status).toBe(200);
        });
    }, 10000);

    test("It should return 200 (Resourse Updated). Token OK and Permission OK", async () => {
      await api
        .patch(`/api/products/${productsCreated[12]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[3].token}`)
        .send(
          getProductData(
            "Product Updated From Api",
            "It should return 200 (Resourse Updated). Token OK and Permission OK",
            [tagsCreated[0]._id, tagsCreated[2]._id, tagsCreated[5]._id],
            categoriesCreated[0]._id
          )
        )
        .then(response => {
          expect(response.status).toBe(200);
        });
    }, 20000);
  });
}

if (testToRun.delete) {
  describe("Product Delete", () => {
    test("It should return 403 (Unauthorized).. Token: NOT", async () => {
      await api
        .delete(`/api/products/${productsCreated[0]._id}`)
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 403 (Unauthorized).. Token: WRONG", async () => {
      await api
        .delete(`/api/products/${productsCreated[0]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}aaa`)
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 403 (Unauthorized).. Token: OK and Permission: NOT", async () => {
      await api
        .delete(`/api/products/${productsCreated[5]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[2].token}`)
        .then(response => {
          expect(response.status).toBe(403);
        });
    }, 10000);

    test("It should return 204 (Resourse Deleted). Token OK and Permission OK", async () => {
      await api
        .delete(`/api/products/${productsCreated[4]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[5].token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    }, 10000);

    test("It should return 204 (Resourse Deleted). Token OK and Permission OK", async () => {
      await api
        .delete(`/api/products/${productsCreated[1]._id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Barrer ${usersCreated[0].token}`)
        .then(response => {
          expect(response.status).toBe(204);
        });
    }, 20000);
  });
}
