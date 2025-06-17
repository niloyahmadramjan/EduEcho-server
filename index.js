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
    const commentCollection = client.db("eduecho").collection("articlesComments");
    const articleLikeCollection = client.db("eduecho").collection("articlesLikeInfo");
    

    // get all articles
    app.get("/articles", async (req, res) => {
      try {
        const articles = await articlesCollection.find().toArray();
        res.send(articles);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch articles" });
      }
    });

  




    // Get likes grouped by articleId
    app.get("/articles/likes", async (req, res) => {
      try {
        const likes = await articleLikeCollection.find().toArray();
        const grouped = likes.reduce((acc, like) => {
          const articleId = like.articleId;
          if (!acc[articleId]) acc[articleId] = [];
          acc[articleId].push(like.userUID);
          return acc;
        }, {});

        res.send(grouped);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch likes" });
      }
    });

    // get all articles comments

    app.get("/articles/comments", async (req, res) => {
  try {
    const comments = await commentCollection
      .find()
      .sort({ timestamp: -1 }) // newest first
      .toArray();
    res.send(comments);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch comments" });
  }
});


    // get my articles use email
    app.get("/myArticles", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await articlesCollection.find(query).toArray();
      res.send(result);
    });


      // get articles specific id 
    app.get("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await articlesCollection.findOne(filter);
      res.send(result);
    });
      // get articles specific category 
    app.get("/articlesCategory/:catagory", async (req, res) => {
      const catagory = req.params.catagory;
      const filter = {category : catagory};
      const result = await articlesCollection.find(filter).toArray();
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

    //  Toggle like/unlike functionality
    app.post("/articles/likes", async (req, res) => {
      const { articleId, userUID, userName, userEmail, userPhoto } = req.body;

      if (!articleId || !userUID) {
        return res.status(400).send({ error: "Missing articleId or userUID" });
      }

      const existingLike = await articleLikeCollection.findOne({
        articleId,
        userUID,
      });

      if (existingLike) {
        const result = await articleLikeCollection.deleteOne({
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
        const result = await articleLikeCollection.insertOne(likeData);
        return res.send({ message: "Liked", insertedId: result.insertedId });
      }
    });

// post comments
  app.post("/articles/comments", async (req, res) => {
  try {
    const comment = req.body;
    comment.timestamp = new Date();

    if (!comment.article_id || !comment.user_id || !comment.comment) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const result = await commentCollection.insertOne(comment);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to add comment" });
  }
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