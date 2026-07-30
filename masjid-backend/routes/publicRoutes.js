const express = require("express");
const {getPublicData} = require("../models/controllers/publicController");

const router = express.Router();

router.get("/stats", getPublicData);

module.exports = router;