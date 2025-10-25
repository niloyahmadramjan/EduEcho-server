const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/database");

const getAllArticles = async (req, res) => {
  try {
    const { articles } = getCollections();
    const articlesList = await articles.find().toArray();
    res.send(articlesList);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch articles" });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { articles } = getCollections();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await articles.findOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch article" });
  }
};

const getArticlesByCategory = async (req, res) => {
  try {
    const { articles } = getCollections();
    const category = req.params.category;
    const filter = { category: category };
    const result = await articles.find(filter).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch articles by category" });
  }
};

const getMyArticles = async (req, res) => {
  try {
    const { articles } = getCollections();
    const userEmail = req.query.email;

    if (req.decoded.email !== userEmail) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const query = { email: userEmail };
    const result = await articles.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch user articles" });
  }
};

const createArticle = async (req, res) => {
  try {
    const { articles } = getCollections();
    const postArticle = req.body;
    const newArticle = { ...postArticle, createdAt: new Date() };
    const result = await articles.insertOne(newArticle);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to create article" });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { articles } = getCollections();
    const id = req.params.id;
    const updateData = req.body;
    delete updateData._id;
    const filter = { _id: new ObjectId(id) };
    const updateArticle = {
      $set: updateData,
    };
    const result = await articles.updateOne(filter, updateArticle);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to update article" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { articles } = getCollections();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await articles.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to delete article" });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  getMyArticles,
  createArticle,
  updateArticle,
  deleteArticle
};