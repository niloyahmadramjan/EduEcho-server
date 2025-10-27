const express = require("express");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const { getCollections } = require("../config/database");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllArticles,
  updateArticleStatus,
  deleteArticle,
  getAllComments,
  deleteComment,
  getRecentActivity,
} = require("../controllers/adminController");

const router = express.Router();
// ✅ Add admin check endpoint (before admin verification)
router.get("/check-admin", verifyFirebaseToken, async (req, res) => {
  try {
    const { users } = getCollections();

    // ✅ Use req.user.email instead of req.decoded.email
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).send({ isAdmin: false, message: "Unauthorized: No email found in token" });
    }

    const user = await users.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ isAdmin: false, message: "User not found" });
    }

    // ✅ Respond with user info and admin status
    res.send({
      isAdmin: user.role === "admin",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).send({ isAdmin: false, error: "Failed to check admin status" });
  }
});


// All routes require JWT + Admin verification
router.use(verifyFirebaseToken, verifyAdmin);

// Dashboard stats
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activity", getRecentActivity);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Article management
router.get("/articles", getAllArticles);
router.patch("/articles/:id/status", updateArticleStatus);
router.delete("/articles/:id", deleteArticle);

// Comment management
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

module.exports = router;
