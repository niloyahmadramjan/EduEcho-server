const express = require("express");
const {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  getMyArticles,
  createArticle,
  updateArticle,
  deleteArticle
} = require("../controllers/articleController");
const verifyJWT = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.get("/category/:category", getArticlesByCategory);
router.get("/my/articles", verifyJWT, getMyArticles);
router.post("/", createArticle);
router.patch("/:id", updateArticle);
router.delete("/:id", deleteArticle);

module.exports = router;