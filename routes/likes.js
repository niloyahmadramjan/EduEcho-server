const express = require("express");
const {
  getLikes,
  toggleLike
} = require("../controllers/likeController");

const router = express.Router();

router.get("/likes", getLikes);
router.post("/likes", toggleLike);

module.exports = router;