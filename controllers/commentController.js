const { getCollections } = require("../config/database");

const getComments = async (req, res) => {
  try {
    const { comments } = getCollections();
    const commentsList = await comments
      .find()
      .sort({ timestamp: -1 })
      .toArray();
    res.send(commentsList);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch comments" });
  }
};

const createComment = async (req, res) => {
  try {
    const { comments } = getCollections();
    const comment = req.body;
    comment.timestamp = new Date();

    if (!comment.article_id || !comment.user_id || !comment.comment) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const result = await comments.insertOne(comment);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to add comment" });
  }
};

module.exports = {
  getComments,
  createComment
};