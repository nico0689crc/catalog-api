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

-- Install MongoDb. Follow these installation steps with your current operative system. https://docs.mongodb.com/manual/installation
-- Create an user with a password that be able to access the database.
<br>
How to do that?
<br>
https://docs.mongodb.com/manual/tutorial/create-users/
<br>
You can run these commands to create different users with propers roles.
<br><br>
`Admin Role`
```
db.createUser({
      user: [userName],
      pwd: [password],
      roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" },
                { role: "dbAdminAnyDatabase",   db: "admin" }
             ]
  });
```
  <br><br>
`User of catalog DB`
```
    db.createUser({
      user: [userName],
      pwd: [password],
      roles: [
                { role: "userAdmin", db: "catalog" },
                { role: "dbAdmin",   db: "catalog" },
                { role: "readWrite", db: "catalog" }
             ]
  });
```
-- Create a Sendgrid Account. It is necessary to have API KEY and Email address verified

-- Run the following command to install npm packages dependencies: 
`npm install`

-- Once installed the project dependencies is necessary to create a .env file in the `root` directory. 
-- You can copy the content of ".env.template" from the root directory and replace it with your data.
<br>
```
DB_USER_NAME=[Database userName created previously]
DB_PASSWORD=[Password assigned to the userName]
DB_CLUSTER_NAME=[IP where the DB server is running]
DB_DATABASE_NAME=[Database name]

API_URL_BASE=[IP and PORT where this API is running follow by /api - For example: http://192.168.1.4:3300/api]
SERVER_URL_BASE=[IP and PORT where this API is running without /api - For example: http://192.168.1.4:3300/api]
RUNNING_PORT=3300

JWT_KEY=[JWT SECRET KEY]
JWT_EXPIRATION_TIME=1h

SENDGRID_API_KEY=[SENDGRID API KEY]
SENDGRID_EMAIL_FROM=[SENDGRID EMAIL VERIFIED]
```
<br>

### `npm start`

Runs the app in the development mode.

### `npm run build`

Builds the app for production to the `build` folder.\



