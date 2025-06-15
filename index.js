const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

// Midleware
app.use(express.json());
app.use(cors());

// MongoDB connection

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const articlesCollection = client.db("eduecho").collection("allArticles");
    const userCollection = client.db("eduecho").collection("userInfo");
    const articleLikeCollection = client
      .db("eduecho")
      .collection("articlesLikeInfo");

    // get all articles
    app.get("/articles", async (req, res) => {
      try {
        const articles = await articlesCollection.find().toArray();
        res.send(articles);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch articles" });
      }
    });

    // get my articles use email
    app.get("/myArticles", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await articlesCollection.find(query).toArray();
      res.send(result);
    });

    //user info collect
    app.post("/userinfo", async (req, res) => {
      const { uid, name, email, photo } = req.body;

      try {
        const existingUser = await userCollection.findOne({ uid });

        if (!existingUser) {
          const result = await userCollection.insertOne({
            uid,
            name,
            email,
            photo,
            createdAt: new Date(),
          });
          res
            .status(201)
            .send({ message: "User created", userId: result.insertedId });
        } else {
          res.status(200).send({ message: "User already exists" });
        }
      } catch (error) {
        res.status(500).send({ message: "Error saving user", error });
      }
    });

    // user info get
    app.get("/userinfo/:uid", async (req, res) => {
      const uid = req.params.uid;
      const user = await userCollection.findOne({ uid: uid });
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      res.send(user);
    });

    // post article
    app.post("/articles", async (req, res) => {
      const postArticle = req.body;
      const newArticle = { ...postArticle, createdAt: new Date() };
      const result = await articlesCollection.insertOne(newArticle);
      res.send(result);
    });

    // store articles likes
    app.post("/articles/likes", async (req, res) => {
      const likesInfo = req.body;
      const result = await articleLikeCollection.insertOne(likesInfo);
      res.send(result);
    });

    //update article
    app.patch("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      delete updateData._id;
      const filter = { _id: new ObjectId(id) };
      const updateArticle = {
        $set: updateData,
      };
      const result = await articlesCollection.updateOne(filter, updateArticle);
      res.send(result);
    });

    // delete articles
    app.delete("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await articlesCollection.deleteOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`EduEcho server is running on ${port}`);
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
