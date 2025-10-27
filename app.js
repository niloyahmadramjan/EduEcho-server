const express = require("express");
const cors = require("./middleware/cors");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const userRoutes = require("./routes/users");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(express.json());
app.use(cors);

// Routes
app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/users", userRoutes);
app.use("/articles", likeRoutes); // Mounted under /articles
app.use("/articles", commentRoutes); // Mounted under /articles
app.use("/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.send(`EduEcho server is running`);
});

module.exports = app;