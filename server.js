require("dotenv").config();
const app = require("./app");
const { connectToDatabase } = require("./config/database");

const port = process.env.PORT || 3000;

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();