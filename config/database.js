const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("eduecho");
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
}

function getCollections() {
  const database = getDatabase();
  return {
    articles: database.collection("allArticles"),
    users: database.collection("userInfo"),
    comments: database.collection("articlesComments"),
    likes: database.collection("articlesLikeInfo")
  };
}

module.exports = {
  connectToDatabase,
  getDatabase,
  getCollections,
  client
};