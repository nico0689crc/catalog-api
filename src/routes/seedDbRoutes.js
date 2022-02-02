const express = require("express");
const { seedDbServices } = require("../services");

const seedDbRoutes = express.Router();

seedDbRoutes.get("/", seedDbServices.getSeedDb);

module.exports = seedDbRoutes;
