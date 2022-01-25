const { databaseConfig } = require("../src/config");
const resourcesProductTest = require("../resourcesProductTest.json");
const fs = require("fs");

const User = require("../src/models/user");
const Product = require("../src/models/product");
const Tag = require("../src/models/tag");
const Comment = require("../src/models/comment");
const Category = require("../src/models/category");

let usersCreated = [];
let tagsCreated = [];
let categoriesCreated = [];
let productsCreated = [];

const createUser = async () => {
  await User.deleteMany({});

  const usersToCreate = [
    {
      name: "Nicolas 1 - User",
      email: "dobvikes@kuedi.mv",
      password: "123456",
      avatar: "",
      role: "user",
      status: "active",
    },
    {
      name: "Nicolas 2 - User",
      email: "wak@uptu.ga",
      password: "123456",
      avatar: "",
      role: "user",
      status: "active",
    },
    {
      name: "Nicolas 3 - User",
      email: "mib@awugaj.bo",
      password: "123456",
      avatar: "",
      role: "user",
      status: "active",
    },
    {
      name: "Nicolas 4 - Admin",
      email: "ov@na.hn",
      password: "123456",
      avatar: "",
      role: "admin",
      status: "active",
    },
    {
      name: "Nicolas 5 - Admin",
      email: "sat@kono.vg",
      password: "123456",
      avatar: "",
      role: "admin",
      status: "active",
    },
    {
      name: "Nicolas 6 - Admin",
      email: "tafoso@nuheguwi.ps",
      password: "123456",
      avatar: "",
      role: "admin",
      status: "active",
    },
    {
      name: "Nicolas 7 - Admin",
      email: "nico.06.89crc@gmail.com",
      password: "REgaTAS123!@",
      avatar: "",
      role: "admin",
      status: "active",
    },
  ];

  for (i = 0; i < usersToCreate.length; i++) {
    const { name, email, password, avatar, role, status } = usersToCreate[i];
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
};

const createTags = async () => {
  await Tag.deleteMany({});

  const tagsToCreate = [
    { name: "Tag 1", slug: "tag_1", creators: usersCreated[3]._id },
    { name: "Tag 2", slug: "tag_2", creators: usersCreated[3]._id },
    { name: "Tag 3", slug: "tag_3", creators: usersCreated[3]._id },
    { name: "Tag 4", slug: "tag_4", creators: usersCreated[4]._id },
    { name: "Tag 5", slug: "tag_5", creators: usersCreated[4]._id },
    { name: "Tag 6", slug: "tag_6", creators: usersCreated[4]._id },
    { name: "Tag 7", slug: "tag_7", creators: usersCreated[5]._id },
    { name: "Tag 8", slug: "tag_8", creators: usersCreated[5]._id },
    { name: "Tag 9", slug: "tag_9", creators: usersCreated[5]._id },
  ];

  tagsCreated = await Tag.insertMany(tagsToCreate);
};

const createCategories = async () => {
  await Category.deleteMany({});

  const categoriesToCreate = [
    {
      name: "Category Example 1",
      description:
        "Qui commodo aute cillum sit culpa labore in id amet consequat magna sint laboris. Voluptate labore sint quis culpa. Tempor qui cupidatat laboris nostrud qui nostrud ullamco ea ut nostrud fugiat aliquip adipisicing. Labore deserunt laborum proident incididunt ut enim laboris voluptate irure qui voluptate id. Reprehenderit sunt ullamco anim cupidatat nisi Lorem mollit excepteur quis excepteur id. Anim eu veniam do occaecat velit sunt quis minim ullamco et commodo enim. Consectetur id qui mollit non exercitation id consequat id incididunt sit deserunt.",
      creators: usersCreated[3]._id,
      slug: "category_example_1",
    },
    {
      name: "Category Example 2",
      description:
        "Cupidatat velit ex esse est in elit et dolor elit ipsum eu et eu. In id ad consequat qui do labore incididunt eiusmod laboris proident quis elit. Ea deserunt excepteur culpa aute mollit pariatur enim est reprehenderit incididunt. Ea proident qui et proident aliqua adipisicing incididunt commodo minim labore incididunt. Quis aliqua cillum eu ullamco labore id ut dolore Lorem. Qui nulla esse ut non deserunt incididunt magna elit sint do aliqua fugiat elit duis.",
      creators: usersCreated[4]._id,
      slug: "category_example_2",
    },
    {
      name: "Category Example 3",
      description:
        "Proident dolore labore laboris est ut quis sit ea sint. Lorem Lorem mollit ad fugiat. Adipisicing amet nulla nulla ea pariatur. Velit nulla eiusmod nisi eu do fugiat amet incididunt ex excepteur in deserunt.",
      creators: usersCreated[4]._id,
      slug: "category_example_3",
    },
  ];

  categoriesCreated = await Category.insertMany(categoriesToCreate);
};

const createProducts = async () => {
  await Product.deleteMany({});

  const IMAGES = [
    "https://http2.mlstatic.com/D_NQ_NP_2X_718953-MLA45825422354_052021-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_807931-MLA48764230169_012022-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_890195-MLA43625599442_092020-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_689503-MLA42454895011_072020-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_726399-MLA43168207415_082020-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_939743-MLA48162136497_112021-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_687138-MLA45014141324_022021-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_774850-MLA43495940257_092020-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_773870-MLA46316503568_062021-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_711131-MLA46112698238_052021-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_841463-MLA32553444734_102019-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_863981-MLA42918720182_072020-F.webp",
  ];

  const productsToCreate = [
    {
      name: "Product Name 1",
      description:
        "Dolore ea ullamco excepteur sint aliqua sunt velit laboris. Reprehenderit ad consectetur occaecat exercitation anim fugiat ullamco enim. Sunt eu nostrud do duis commodo dolor nostrud.",
      quantity: "276",
      price: "9.606",
      tags: [tagsCreated[4]._id, tagsCreated[0]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[0]._id,
      images: [
        IMAGES[4],
        IMAGES[9],
        IMAGES[11],
        IMAGES[7],
        IMAGES[9],
        IMAGES[7],
      ],
    },
    {
      name: "Product Name 2",
      description:
        "lorem-ipsum.lineReprehenderit aliquip adipisicing culpa occaecat duis enim irure ipsum. Eiusmod reprehenderit elit aliquip deserunt nisi ullamco Lorem dolore do ad. Quis labore consequat commodo ea in aute nulla proident mollit fugiat aliqua aliqua aliquip ut. Id velit ut sunt proident mollit voluptate quis dolore. Minim duis officia nisi ullamco magna proident consectetur commodo pariatur proident ullamco reprehenderit officia. Ea sit consequat laborum ut enim. Mollit tempor sunt duis commodo exercitation non sit est.",
      quantity: "812",
      price: "73.3822",
      tags: [tagsCreated[2]._id, tagsCreated[8]._id, tagsCreated[7]._id],
      categories: categoriesCreated[0]._id,
      creators: usersCreated[0]._id,
      images: [
        IMAGES[2],
        IMAGES[8],
        IMAGES[0],
        IMAGES[0],
        IMAGES[5],
        IMAGES[4],
      ],
    },
    {
      name: "Product Name 3",
      description:
        "Aliquip reprehenderit ea dolore amet labore ex nisi. Ea ipsum et nisi irure. Velit voluptate laboris anim excepteur commodo. Velit proident aliqua aliqua aliquip laboris. Aute cupidatat amet proident eiusmod commodo mollit ea pariatur do consectetur. Sunt qui occaecat deserunt Lorem duis ea dolor sint laboris fugiat fugiat anim. Nisi non anim tempor dolore velit aliqua culpa enim occaecat cupidatat non Lorem velit.",
      quantity: "335",
      price: "46.3571",
      tags: [tagsCreated[7]._id, tagsCreated[6]._id, tagsCreated[5]._id],
      categories: categoriesCreated[0]._id,
      creators: usersCreated[0]._id,
      images: [
        IMAGES[0],
        IMAGES[10],
        IMAGES[10],
        IMAGES[8],
        IMAGES[3],
        IMAGES[0],
      ],
    },
    {
      name: "Product Name 4",
      description:
        "Irure tempor occaecat commodo labore ea quis officia. Voluptate incididunt sunt non fugiat ea commodo ipsum occaecat adipisicing sit irure. Aliquip qui magna consequat minim magna dolore ullamco enim in elit.",
      quantity: "331",
      price: "77.0118",
      tags: [tagsCreated[1]._id, tagsCreated[7]._id, tagsCreated[3]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[0]._id,
      images: [
        IMAGES[4],
        IMAGES[11],
        IMAGES[5],
        IMAGES[7],
        IMAGES[6],
        IMAGES[2],
      ],
    },
    {
      name: "Product Name 5",
      description:
        "Non nostrud aliquip elit laboris non et aliquip exercitation laboris elit fugiat. Incididunt do minim adipisicing proident qui cillum. Aute mollit incididunt cillum labore minim nisi sunt in ullamco laborum sint excepteur est do. Ad anim labore aute nostrud fugiat sunt Lorem velit velit sit dolor eu. Consectetur adipisicing adipisicing aliquip qui ea nulla ipsum irure. Sunt dolor voluptate incididunt ad veniam laboris non.",
      quantity: "452",
      price: "55.6699",
      tags: [tagsCreated[4]._id, tagsCreated[8]._id, tagsCreated[5]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[0]._id,
      images: [
        IMAGES[6],
        IMAGES[5],
        IMAGES[6],
        IMAGES[1],
        IMAGES[5],
        IMAGES[7],
      ],
    },
    {
      name: "Product Name 6",
      description:
        "Nisi sit culpa ex sunt commodo excepteur cupidatat eu laboris nisi duis. Voluptate minim consequat ex nisi. Mollit Lorem sit commodo consectetur commodo consequat culpa esse.",
      quantity: "205",
      price: "10.6038",
      tags: [tagsCreated[2]._id, tagsCreated[3]._id, tagsCreated[6]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[1]._id,
      images: [
        IMAGES[1],
        IMAGES[8],
        IMAGES[2],
        IMAGES[11],
        IMAGES[11],
        IMAGES[9],
      ],
    },
    {
      name: "Product Name 7",
      description:
        "Occaecat laboris nostrud cupidatat reprehenderit cupidatat veniam proident et labore laboris proident aute Lorem. Est dolor tempor mollit aliquip ut proident incididunt dolor et labore excepteur mollit anim minim. Non officia minim nostrud labore. Et laborum non proident minim laborum incididunt esse ipsum aliqua incididunt amet veniam veniam elit. Irure labore ut nulla culpa esse commodo tempor minim commodo exercitation.",
      quantity: "17",
      price: "92.6966",
      tags: [tagsCreated[6]._id, tagsCreated[7]._id, tagsCreated[2]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[1]._id,
      images: [
        IMAGES[8],
        IMAGES[2],
        IMAGES[10],
        IMAGES[9],
        IMAGES[8],
        IMAGES[0],
      ],
    },
    {
      name: "Product Name 8",
      description:
        "Sunt ut laboris enim sunt aliqua eu. Et mollit Lorem quis eu ut do. Qui qui proident deserunt commodo. Deserunt do eiusmod mollit minim. Exercitation ullamco amet excepteur incididunt elit proident irure tempor. Pariatur irure aliquip mollit fugiat nostrud qui commodo sint proident occaecat. Officia sunt dolore minim ad commodo esse officia voluptate excepteur enim ullamco ipsum veniam.",
      quantity: "970",
      price: "80.9624",
      tags: [tagsCreated[7]._id, tagsCreated[4]._id, tagsCreated[2]._id],
      categories: categoriesCreated[0]._id,
      creators: usersCreated[1]._id,
      images: [
        IMAGES[10],
        IMAGES[2],
        IMAGES[6],
        IMAGES[11],
        IMAGES[3],
        IMAGES[0],
      ],
    },
    {
      name: "Product Name 9",
      description:
        "Nulla ut adipisicing deserunt non velit cillum duis nostrud ea nostrud officia in ex ad. Pariatur cupidatat ex et fugiat sint est aute pariatur aliqua magna. Enim fugiat irure et elit veniam labore aliqua ex sint labore duis. Sit veniam cillum id et enim. Mollit et elit incididunt non aute cillum sit.",
      quantity: "170",
      price: "46.0006",
      tags: [tagsCreated[2]._id, tagsCreated[3]._id, tagsCreated[8]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[1]._id,
      images: [
        IMAGES[1],
        IMAGES[7],
        IMAGES[5],
        IMAGES[6],
        IMAGES[3],
        IMAGES[9],
      ],
    },
    {
      name: "Product Name 10",
      description:
        "Laborum in minim qui voluptate sunt. Pariatur amet officia enim mollit esse irure culpa dolor adipisicing eu magna anim. Dolore velit esse veniam eiusmod ipsum dolore aute minim magna nisi do ad sunt. Do do sint eu ipsum non sint aliquip dolore. Elit et irure aliqua pariatur adipisicing minim ex amet. Esse esse mollit sit deserunt ut. Minim eu culpa amet pariatur id amet.",
      quantity: "853",
      price: "41.5083",
      tags: [tagsCreated[5]._id, tagsCreated[4]._id, tagsCreated[3]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[1]._id,
      images: [
        IMAGES[5],
        IMAGES[6],
        IMAGES[0],
        IMAGES[10],
        IMAGES[11],
        IMAGES[11],
      ],
    },
    {
      name: "Product Name 11",
      description:
        "Culpa et exercitation elit adipisicing deserunt voluptate deserunt. Pariatur eiusmod duis amet aliqua sit in exercitation consectetur tempor eu aliquip minim sit. Veniam anim duis Lorem ex excepteur ipsum non.",
      quantity: "161",
      price: "45.0768",
      tags: [tagsCreated[7]._id, tagsCreated[1]._id, tagsCreated[6]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[2]._id,
      images: [
        IMAGES[5],
        IMAGES[7],
        IMAGES[11],
        IMAGES[9],
        IMAGES[11],
        IMAGES[1],
      ],
    },
    {
      name: "Product Name 12",
      description:
        "Excepteur ea consectetur minim nisi dolor nisi excepteur aute minim sint exercitation non minim in. Aliqua in est dolore adipisicing aliqua proident nisi magna aliquip voluptate. Ipsum occaecat occaecat officia commodo officia nisi non est. Velit qui consequat eiusmod occaecat enim cupidatat non cillum ut cillum adipisicing qui. Est magna in est elit aliquip sunt mollit officia elit. Amet labore do id aute aliquip labore excepteur.",
      quantity: "38",
      price: "36.6917",
      tags: [tagsCreated[0]._id, tagsCreated[4]._id, tagsCreated[1]._id],
      categories: categoriesCreated[0]._id,
      creators: usersCreated[2]._id,
      images: [
        IMAGES[11],
        IMAGES[5],
        IMAGES[8],
        IMAGES[6],
        IMAGES[2],
        IMAGES[2],
      ],
    },
    {
      name: "Product Name 13",
      description:
        "Duis nostrud dolor proident do ex est anim id. Occaecat voluptate Lorem consectetur culpa quis occaecat. Reprehenderit quis proident irure fugiat pariatur incididunt nostrud labore est sint. Ipsum magna Lorem Lorem amet nostrud in incididunt Lorem consequat enim eiusmod. Incididunt labore aliqua et velit incididunt deserunt. Id dolor enim eu aliquip reprehenderit est non ipsum voluptate. In nostrud velit in dolore fugiat tempor ipsum exercitation aliquip velit incididunt.",
      quantity: "470",
      price: "40.3748",
      tags: [tagsCreated[0]._id, tagsCreated[5]._id, tagsCreated[7]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[2]._id,
      images: [
        IMAGES[1],
        IMAGES[7],
        IMAGES[9],
        IMAGES[11],
        IMAGES[5],
        IMAGES[0],
      ],
    },
    {
      name: "Product Name 14",
      description:
        "Nisi in laborum deserunt pariatur id do sint tempor in ex aliquip nostrud laborum. Fugiat eiusmod commodo in exercitation occaecat. Do dolor commodo id dolore id magna anim in ullamco labore sunt aliquip eiusmod.",
      quantity: "730",
      price: "37.7003",
      tags: [tagsCreated[1]._id, tagsCreated[3]._id, tagsCreated[4]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[2]._id,
      images: [
        IMAGES[0],
        IMAGES[9],
        IMAGES[9],
        IMAGES[9],
        IMAGES[1],
        IMAGES[1],
      ],
    },
    {
      name: "Product Name 15",
      description:
        "In dolor cillum minim consectetur elit deserunt. Fugiat ut deserunt adipisicing exercitation culpa. Ad elit in tempor reprehenderit. Cupidatat est cupidatat ullamco sunt non qui ut id. Nostrud aute exercitation nisi excepteur velit ad ex elit.",
      quantity: "539",
      price: "26.7399",
      tags: [tagsCreated[6]._id, tagsCreated[3]._id, tagsCreated[3]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[2]._id,
      images: [
        IMAGES[8],
        IMAGES[6],
        IMAGES[7],
        IMAGES[4],
        IMAGES[0],
        IMAGES[5],
      ],
    },
    {
      name: "Product Name 16",
      description:
        "Veniam qui exercitation esse reprehenderit aliqua in veniam sunt veniam irure quis esse. Officia eu non minim excepteur dolor tempor labore irure nisi ullamco do id. Reprehenderit laborum esse mollit irure laborum id consectetur pariatur. Dolor adipisicing ipsum incididunt exercitation voluptate excepteur ex ea. Deserunt anim aliquip culpa culpa ipsum.",
      quantity: "311",
      price: "46.3838",
      tags: [tagsCreated[6]._id, tagsCreated[6]._id, tagsCreated[1]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[3]._id,
      images: [
        IMAGES[2],
        IMAGES[7],
        IMAGES[0],
        IMAGES[3],
        IMAGES[6],
        IMAGES[5],
      ],
    },
    {
      name: "Product Name 17",
      description:
        "Irure in incididunt exercitation aliquip duis nostrud irure incididunt consectetur do anim reprehenderit pariatur mollit. Irure fugiat elit proident laboris tempor deserunt ea aliquip tempor. Sint irure Lorem amet magna dolor culpa. Voluptate fugiat exercitation tempor consectetur labore dolore aliquip consequat adipisicing magna deserunt. Anim sunt non laboris mollit aliquip cillum labore dolor ut id do sint aliqua. Consectetur tempor magna voluptate sit sint qui sint.",
      quantity: "196",
      price: "45.668",
      tags: [tagsCreated[5]._id, tagsCreated[5]._id, tagsCreated[5]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[3]._id,
      images: [
        IMAGES[10],
        IMAGES[8],
        IMAGES[3],
        IMAGES[6],
        IMAGES[1],
        IMAGES[9],
      ],
    },
    {
      name: "Product Name 18",
      description:
        "Ullamco minim sit qui proident id. Nostrud nostrud ex fugiat irure quis pariatur exercitation. Labore non Lorem veniam sunt labore elit nisi sint ut cillum deserunt exercitation adipisicing.",
      quantity: "212",
      price: "5.3743",
      tags: [tagsCreated[0]._id, tagsCreated[1]._id, tagsCreated[4]._id],
      categories: categoriesCreated[2]._id,
      creators: usersCreated[3]._id,
      images: [
        IMAGES[4],
        IMAGES[8],
        IMAGES[3],
        IMAGES[0],
        IMAGES[3],
        IMAGES[6],
      ],
    },
    {
      name: "Product Name 19",
      description:
        "Labore proident reprehenderit anim ipsum aute ipsum ut sint do culpa pariatur sint tempor commodo. Consectetur nulla deserunt et aliqua veniam aute laborum magna. Incididunt id laboris sit veniam proident deserunt enim ea dolor. Excepteur laborum amet magna eu adipisicing nostrud commodo consectetur dolore dolore consequat elit magna proident.",
      quantity: "118",
      price: "67.9085",
      tags: [tagsCreated[4]._id, tagsCreated[3]._id, tagsCreated[2]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[3]._id,
      images: [
        IMAGES[5],
        IMAGES[6],
        IMAGES[6],
        IMAGES[7],
        IMAGES[3],
        IMAGES[10],
      ],
    },
    {
      name: "Product Name 20",
      description:
        "Nulla eiusmod incididunt ea ea eu fugiat irure. Ea enim tempor aute laboris duis magna aliqua do commodo eu sint voluptate. Occaecat excepteur culpa anim duis. Aliqua do pariatur dolor ea Lorem est cupidatat excepteur enim et magna adipisicing id. Dolore occaecat do sunt minim pariatur tempor laboris. Occaecat ut elit ipsum ut. Id ea cupidatat sit occaecat nulla.",
      quantity: "558",
      price: "79.0538",
      tags: [tagsCreated[2]._id, tagsCreated[1]._id, tagsCreated[4]._id],
      categories: categoriesCreated[1]._id,
      creators: usersCreated[3]._id,
      images: [
        IMAGES[8],
        IMAGES[7],
        IMAGES[8],
        IMAGES[8],
        IMAGES[3],
        IMAGES[6],
      ],
    },
  ];

  for (i = 0; i < productsToCreate.length; i++) {
    const product = await Product.createCustomTesting(productsToCreate[i]);
    productsCreated.push(product);
  }
};

const createResourcesProductTestInit = async (recreateDb, initDb) => {
  if (initDb) {
    await databaseConfig.connect(() => {}, true);
  }
  if (recreateDb) {
    await createUser();
    await createTags();
    await createCategories();
    await createProducts();

    const resources = {
      usersCreated,
      tagsCreated,
      categoriesCreated,
      productsCreated,
    };
    if (initDb) {
      fs.writeFileSync("resourcesProductTest.json", JSON.stringify(resources));
    }
  } else {
    usersCreated = resourcesProductTest.usersCreated;
    tagsCreated = resourcesProductTest.tagsCreated;
    categoriesCreated = resourcesProductTest.categoriesCreated;
    productsCreated = resourcesProductTest.productsCreated;
  }

  return { usersCreated, tagsCreated, categoriesCreated, productsCreated };
};

module.exports = {
  createResourcesProductTestInit,
};
