const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/database");

const getDashboardStats = async (req, res) => {
  try {
    const { articles, users, comments, likes } = getCollections();
    
    const [
      totalUsers,
      totalArticles,
      totalComments,
      totalLikes,
      recentUsers,
      recentArticles
    ] = await Promise.all([
      users.countDocuments(),
      articles.countDocuments(),
      comments.countDocuments(),
      likes.countDocuments(),
      users.find().sort({ createdAt: -1 }).limit(5).toArray(),
      articles.find().sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    const articlesByCategory = await articles.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailySignups = await users.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]).toArray();

    res.send({
      overview: {
        totalUsers,
        totalArticles,
        totalComments,
        totalLikes
      },
      charts: {
        articlesByCategory,
        dailySignups
      },
      recent: {
        users: recentUsers,
        articles: recentArticles
      }
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch dashboard stats" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { users } = getCollections();
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [userList, total] = await Promise.all([
      users.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      users.countDocuments(query)
    ]);

    res.send({
      users: userList,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { users } = getCollections();
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'author', 'admin'].includes(role)) {
      return res.status(400).send({ error: "Invalid role" });
    }

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );

    res.send({ message: "User role updated successfully", result });
  } catch (error) {
    res.status(500).send({ error: "Failed to update user role" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { users } = getCollections();
    const { id } = req.params;

    const result = await users.deleteOne({ _id: new ObjectId(id) });
    res.send({ message: "User deleted successfully", result });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user" });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const { articles } = getCollections();
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      category = '',
      search = '' 
    } = req.query;
    
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [articleList, total] = await Promise.all([
      articles.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      articles.countDocuments(query)
    ]);

    res.send({
      articles: articleList,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch articles" });
  }
};

const updateArticleStatus = async (req, res) => {
  try {
    const { articles } = getCollections();
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).send({ error: "Invalid status" });
    }

    const result = await articles.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.send({ message: "Article status updated successfully", result });
  } catch (error) {
    res.status(500).send({ error: "Failed to update article status" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { articles } = getCollections();
    const { id } = req.params;

    const result = await articles.deleteOne({ _id: new ObjectId(id) });
    res.send({ message: "Article deleted successfully", result });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete article" });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { comments } = getCollections();
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    const [commentList, total] = await Promise.all([
      comments.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      comments.countDocuments(query)
    ]);

    res.send({
      comments: commentList,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch comments" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { comments } = getCollections();
    const { id } = req.params;

    const result = await comments.deleteOne({ _id: new ObjectId(id) });
    res.send({ message: "Comment deleted successfully", result });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete comment" });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { articles, users, comments } = getCollections();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [newArticles, newUsers, newComments] = await Promise.all([
      articles.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      users.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      comments.countDocuments({ timestamp: { $gte: oneDayAgo } })
    ]);

    res.send({
      last24Hours: {
        newArticles,
        newUsers,
        newComments
      }
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch recent activity" });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllArticles,
  updateArticleStatus,
  deleteArticle,
  getAllComments,
  deleteComment,
  getRecentActivity
};