const { getCollections } = require("../config/database");

const getLikes = async (req, res) => {
  try {
    const { likes } = getCollections();
    const likesList = await likes.find().toArray();
    const grouped = likesList.reduce((acc, like) => {
      const articleId = like.articleId;
      if (!acc[articleId]) acc[articleId] = [];
      acc[articleId].push(like.userUID);
      return acc;
    }, {});

    res.send(grouped);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch likes" });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { likes } = getCollections();
    const { articleId, userUID, userName, userEmail, userPhoto } = req.body;

    if (!articleId || !userUID) {
      return res.status(400).send({ error: "Missing articleId or userUID" });
    }

    const existingLike = await likes.findOne({
      articleId,
      userUID,
    });

    if (existingLike) {
      const result = await likes.deleteOne({
        articleId,
        userUID,
      });
      return res.send({
        message: "Unliked",
        deletedCount: result.deletedCount,
      });
    } else {
      const likeData = {
        articleId,
        userUID,
        userName,
        userEmail,
        userPhoto,
        likedAt: new Date(),
      };
      const result = await likes.insertOne(likeData);
      return res.send({ message: "Liked", insertedId: result.insertedId });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to toggle like" });
  }
};

module.exports = {
  getLikes,
  toggleLike
};