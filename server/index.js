const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 8000;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xkl5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client
      .db("Shop-Genius-db")
      .collection("products");
    const cartCollection = client.db("Shop-Genius-db").collection("cart");
    const userCollection = client.db("Shop-Genius-db").collection("users");

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // products
    app.get("/products", async (req, res) => {
      const page = parseInt(req?.query?.page) || 1;
      const limit = parseInt(req?.query?.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = req?.query?.sort;
      const search = req?.query?.search;
      const inStock = req?.query?.inStock;
      const onSale = req?.query?.onSale;
      const categoryName = req?.query?.category;
      const popular = req?.query?.popular;

      // console.log(inStock, onSale, typeof inStock, typeof onSale);

      let query = {};
      if (search) {
        query = {
          $or: [
            { brand: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
          ],
        };
      }

      if (inStock === "true") {
        query = { ...query, "availability.available": true };
      }

      if (onSale === "true") {
        query = { ...query, "discount.active": true };
      }

      let options = {};

      if (popular === "true") {
        options = { sold_count: -1 };
      }

      if (sort === "asc") {
        options = { price: "1" };
      } else if (sort === "desc") {
        options = { price: "-1" };
      } else if (sort === "asc-r") {
        options = { "rating.score": "1" };
      } else if (sort === "desc-r") {
        options = { "rating.score": "-1" };
      }

      if (categoryName) {
        query = { ...query, category: categoryName };
      }

      const result = await productCollection
        .find(query)
        .sort(options)
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    app.get("/products-count", async (req, res) => {
      const search = req?.query?.search;
      const categoryName = req?.query?.category;
      const inStock = req?.query?.inStock;
      const onSale = req?.query?.onSale;
      let query = {};
      if (search) {
        query = {
          $or: [
            { brand: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
          ],
        };
      }

      if (inStock === "true") {
        query = { ...query, "availability.available": true };
      }

      if (onSale === "true") {
        query = { ...query, "discount.active": true };
      }

      if (categoryName) {
        query = { ...query, category: categoryName };
      }

      const count = await productCollection.countDocuments(query);
      res.send({ count });
    });

    app.get("/product/details/:id", async (req, res) => {
      const { id } = req?.params;
      const result = await productCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/discounted-products", async (req, res) => {
      const result = await productCollection
        .find({ "discount.active": true })
        .toArray();
      res.send(result);
    });

    // popular products
    app.get(`/popular-products`, async (req, res) => {
      const result = await productCollection.find({ popular: true }).toArray();
      res.send(result);
    });

    // best-seller
    app.get(`/best-seller-products`, async (req, res) => {
      const gender = req?.query?.gender;
      const result = await productCollection
        .find({ targetGender: gender })
        .sort({ sold_count: -1 })
        .toArray();

      res.send(result);
    });

    // carts
    app.get(`/cart`, async (req, res) => {
      const { email } = req?.query;
      const result = await cartCollection
        .find({ "userInfo.email": email })
        .toArray();
      res.send(result);
    });

    app.post(`/cart`, async (req, res) => {
      const item = req?.body;
      console.log(item);
      const cartItem = { ...item, date: Date.now() };
      // Check if this user already added this product
      const isAlreadyExist = await cartCollection.findOne({
        "userInfo.email": item.userInfo.email,
        productId: item.productId,
      });

      if (isAlreadyExist) {
        return res.status(200).json({
          message: "Item already exists in cart",
          inserted: false,
          existingItemId: isAlreadyExist._id,
        });
      }
      const data = await cartCollection.insertOne(cartItem);
      res.send(data);
    });

    app.delete(`/cart/:id`, async (req, res) => {
      const id = req?.params?.id;
      const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
        console.log("Logout successful");
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from StayVista Server..");
});

app.listen(port, () => {
  console.log(`ShopGenius is running on port ${port}`);
});
