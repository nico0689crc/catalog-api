const fs = require("fs");
const rando = require("random-number-in-range");
const { Product, Tag, Comment, Category, User } = require("../models");
const { tryCatch, ResponseParser } = require("../shared");
const {
  usersData,
  tagsData,
  categoriesData,
  productsData,
} = require("../utils/seeds");
const categoriesDataAux = require("../utils/seeds/aux/categories.json");
const productsDataAux = require("../utils/seeds/aux/products.json");

const seedUsers = async () => {
  const usersCreated = [];

  await User.deleteMany({});

  for (i = 0; i < usersData.length; i++) {
    const { name, email, password, avatar, role, status } = usersData[i];
    const user = await User.register(
      {
        name,
        email,
        password,
        avatar,
        role,
        status,
      },
      null,
      true
    );
    usersCreated.push(user);
  }
  return usersCreated;
};

const seedTags = async usersCreated => {
  await Tag.deleteMany({});

  const tagsToCreate = tagsData.map(tag => {
    return {
      name: tag.name,
      slug: tag.slug,
      creators: usersCreated[rando(3, 6)],
    };
  });

  const tagsCreated = await Tag.insertMany(tagsToCreate);

  return tagsCreated;
};

const seedCategories = async usersCreated => {
  await Category.deleteMany({});

  const categoriesToCreate = categoriesData.map(category => {
    return {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      creators: usersCreated[rando(3, 6)],
    };
  });

  const categoriesCreated = await Category.insertMany(categoriesToCreate);

  return categoriesCreated;
};

const seedProducts = async (usersCreated, tagsCreated) => {
  await Product.deleteMany({});

  const productsCreated = [];

  for (product of productsData) {
    if (product.category_slug) {
      const category = await Category.findOne({ slug: product.category_slug });

      const productAux = {
        ...product,
        categories: category ? category.id : null,
        tags: [
          tagsCreated[rando(0, 8)].id,
          tagsCreated[rando(0, 8)].id,
          tagsCreated[rando(0, 8)].id,
          tagsCreated[rando(0, 8)].id,
          tagsCreated[rando(0, 8)].id,
        ],
        creators: usersCreated[rando(3, 6)],
      };

      const productCreated = await Product.createCustomTesting(productAux);

      productsCreated.push(productCreated);
    }
  }

  return productsCreated;
};

const createCategoriesFile = () => {
  const categories = [];

  for (let i = 0; i < categoriesDataAux.length; i++) {
    if (
      categoriesDataAux[i].parent_id === null &&
      categoriesDataAux[i].type_id === 1
    ) {
      categories.push({
        name: categoriesDataAux[i].name,
        description:
          "Laboris ipsum deserunt commodo incididunt ut anim. Magna quis sit anim dolore consequat. Quis velit do amet Lorem duis dolor elit eu pariatur est duis aliqua amet magna. Eu deserunt adipisicing tempor sint aliquip labore anim dolore consectetur qui do. Laborum occaecat ex quis reprehenderit consequat cillum ut ad id et ea Lorem sunt do. Adipisicing ullamco ex occaecat exercitation culpa deserunt mollit culpa cillum sit incididunt aliquip do ipsum. Ad laboris dolore amet reprehenderit.",
        icon: categoriesDataAux[i].icon,
        slug: categoriesDataAux[i].slug,
      });
    }
  }

  fs.writeFileSync("categories.json", JSON.stringify(categories));
};

const createProductsFile = () => {
  const products = [];

  for (let i = 0; i < productsDataAux.length; i++) {
    if (productsDataAux[i].type_id === 1) {
      const images = [];

      images.push({
        original: productsDataAux[i].image.original,
        thumbnail: productsDataAux[i].image.thumbnail,
      });

      for (const image of productsDataAux[i].gallery) {
        images.push({
          original: image.original,
          thumbnail: image.thumbnail,
        });
      }

      products.push({
        name: productsDataAux[i].name,
        description: productsDataAux[i].description,
        slug: productsDataAux[i].slug,
        quantity: productsDataAux[i].quantity,
        price: productsDataAux[i].price,
        sale_price: productsDataAux[i].sale_price,
        unit: productsDataAux[i].unit,
        category_slug: productsDataAux[i].categories[0].slug,
        images: images,
      });
    }
  }

  fs.writeFileSync("products.json", JSON.stringify(products));
};

const getSeedDb = (req, res, next) => {
  tryCatch(async () => {
    const usersCreated = await seedUsers();
    const tagsCreated = await seedTags(usersCreated);
    const categoriesCreated = await seedCategories(usersCreated);
    const productsCreated = await seedProducts(usersCreated, tagsCreated);

    // createCategoriesFile();
    // createProductsFile();

    res.send("All good mate!");
  }, next);
};

module.exports = { getSeedDb };
