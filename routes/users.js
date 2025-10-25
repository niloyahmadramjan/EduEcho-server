const express = require("express");
const {
  createUser,
  getUserByUID
} = require("../controllers/userController");

const router = express.Router();

router.post("/userinfo", createUser);
router.get("/userinfo/:uid", getUserByUID);

module.exports = router;