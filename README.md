# Catalog API - Backend Documentation

# Introduction

Catalog API - Backend is a personal project for learning propose and not commercial ends. 
It is a clone of https://pickbazar-react-rest.vercel.app.

Catalog API - Backend's main objective is to provide data for a Grocery Shop. The API structure response follows the JSON:API specification.

# Demo Links

All Products Endpoint: http://catalog-api.nicolasfernandez.online/api/products
<br>
Individual Product Endpoint: http://catalog-api.nicolasfernandez.online/api/products/621cda0faf4507be7da566da
<br><br>
All Categories Endpoint: http://catalog-api.nicolasfernandez.online/api/categories
<br>
Individual Category Endpoint: http://catalog-api.nicolasfernandez.online/api/categories/621cda0faf4507be7da566cd

# Tech I Have Used

- NodeJs
- ExpressJs
- Sendgrid Api Integration
- MongoDb
- I18Next for backend
- JsonWebtoken
- Multer

<br>

# Getting Started & Installation

For getting started with the project you have to follow the below procedure. 

-- Install MongoDb. Follow this installation steps with your current operative system. https://docs.mongodb.com/manual/installation
-- Create an user with password that be able to access the database.
<br>
How to do that?
<br>
https://docs.mongodb.com/manual/tutorial/create-users/
<br>
You can run this commands to create differents users with propers roles.
<br><br>
`Admin Role`
db.createUser({
      user: [userName],
      pwd: [password],
      roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" },
                { role: "dbAdminAnyDatabase",   db: "admin" }
             ]
  });
  <br><br>
  `User of catalog DB`
    db.createUser({
      user: [userName],
      pwd: [password],
      roles: [
                { role: "userAdmin", db: "catalog_production" },
                { role: "dbAdmin",   db: "catalog_production" },
                { role: "readWrite", db: "catalog_production" }
             ]
  });

-- Create a Sendgrid Account. It is necessary to have API KEY and Email address verified

-- Run the follow command to install npm packages dependencies: 
`npm install`

-- Once installed the project dependencies is necessary to create a .env file in the `root` directory. You can copy the content of ".env.template" from the root directory and replace with your own data.
<br>

### `npm start`

Runs the app in the development mode.

### `npm run build`

Builds the app for production to the `build` folder.\



