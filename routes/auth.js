const express = require("express");
const { issueToken } = require("../controllers/authController");

const router = express.Router();

router.post("/jwt", issueToken);

module.exports = router;