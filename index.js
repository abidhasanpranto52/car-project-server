const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fkms10x.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toyProject").collection("toys");

    app.post("/postToy", async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
      console.log(body);
    });

    app.get("/alltoys", async (req, res) => {
      const query = {};
      const result = await toysCollection.find(query).limit(20).toArray();
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const sort = req.query.sort;
      const search = req.query.search;
      console.log(search);
      // const query = {};
      const query = { title: { $regex: search, $options: "i" } };
      const options = {
        // sort matched documents in descending order by rating
        $sort: {
          price: sort === "asc" ? 1 : -1,
        },
      };
      const cursor = toysCollection.find(query, options);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/mytoys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await toysCollection
        .find({ postedBy: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/alltoys/:category", async (req, res) => {
      console.log(req.params.id);
      if (
        req.params.category == "sports" ||
        req.params.category == "truck" ||
        req.params.category == "police"
      ) {
        const result = await toysCollection
          .find({ subCategory: req.params.category })
          .toArray();
        return res.send(result);
      }
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateToy = req.body;
      console.log(updateToy);
      const updateDoc = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Find a document
    app.get("/toydetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          price: 1,
          toy_id: 1,
          image: 1,
          seller: 1,
          postedBy: 1,
          rating: 1,
          quantity: 1,
          description: 1,
        },
      };
      const result = await toysCollection.findOne(query, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("Toys Car Server Is Running");
});

app.listen(port, () => {
  console.log(`Toys car server is running on Port ${port}`);
});
