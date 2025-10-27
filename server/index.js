const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
  // console.log(token);
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
    const bookingCollection = client
      .db("Shop-Genius-db")
      .collection("bookings");

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

    const verifyAdmin = async (req, res, next) => {
      const user = req?.user;
      const query = { email: user?.email };
      const result = await userCollection.findOne(query);
      if (!result || result.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    const verifySeller = async (req, res, next) => {
      const user = req?.user;
      const query = { email: user?.email };
      const result = await userCollection.findOne(query);
      if (!result || result.role !== "seller") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

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
      console.log(categoryName);
      if (categoryName) {
        // if (categoryName === "all") {
        //   query = {};
        // } else {
        query = { ...query, category: categoryName };
        // }
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

    app.post(`/products`, async (req, res) => {
      const product = req?.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.patch(`/update-product-sold-count/:id`, async (req, res) => {
      const id = req?.params?.id;
      const { sold_count } = req?.body;
      const updatedDoc = {
        $set: {
          sold_count,
        },
      };
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        updatedDoc
      );
      res.send(result);
    });

    // payments
    app.post("/create-payment-intent", async (req, res) => {
      const price = req?.body?.total;
      // console.log('price',price);
      //stripe accepts price in cents which is why converted it into cents by multiplying it with 100;
      const priceInCent = parseFloat(price) * 100;
      if (!price || priceInCent < 1) return;

      // generate a client secret key

      // console.log(priceInCent);
      const { client_secret } = await stripe.paymentIntents.create({
        amount: priceInCent,
        currency: "cad",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // send it to client
      res.send({ clientSecret: client_secret });
    });

    // booking
    app.post("/booking", verifyToken, async (req, res) => {
      const booking = req?.body;
      // console.log(booking);

      if (booking?.source) {
        if (booking?.source === "Product-details") {
          const isExistInCart = await cartCollection.findOne({
            _id: new ObjectId(booking?.productBookingId),
          });
          // console.log("productfound", isExistInCart);
          if (isExistInCart) {
            await cartCollection.deleteOne({
              _id: new ObjectId(booking?.productBookingId),
            });
          }
          delete booking?.source;
        }
      } else {
        const isExistInCart = await cartCollection.findOne({
          productBookingId: booking?.productBookingId,
        });
        // console.log("productfound", isExistInCart);
        if (isExistInCart) {
          await cartCollection.deleteOne({
            productBookingId: booking?.productBookingId,
          });
        }
      }

      // sendEmail(booking?.guest?.email, {
      //   subject: "Congratulations!",
      //   message: `You have successfully booked the room ${booking?.guest?.name}!Transaction id:${booking?.transactionId}`,
      // });

      const result = await bookingCollection.insertOne(booking);
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

    // Users
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req?.params?.email;
      // console.log('role',email);
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.put(`/users`, async (req, res) => {
      const user = req?.body;
      const query = { email: user?.email };
      const options = { upsert: true };
      const userFound = await userCollection.findOne(query);
      if (userFound) {
        if (user?.status === "requested") {
          const updateUser = await userCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(updateUser);
        } else {
          return res.send(userFound);
        }
      }

      const updatedDoc = {
        $set: {
          ...user,
          timeStamp: Date.now(),
        },
      };

      const result = await userCollection.updateOne(query, updatedDoc, options);

      return res.send(result);
    });

    // dashboard
    // users dashboard
    app.get(`/my-orders/:email`, async (req, res) => {
      const email = req?.params?.email;
      console.log(req?.params);
      const result = await bookingCollection
        .find({ "user.email": email })
        .toArray();
      res.send(result);
    });

    app.delete(`/cancel-order/:id`, async (req, res) => {
      const id = req?.params?.id;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // seller dashboard
    app.get(`/my-products/:email`, async (req, res) => {
      const email = req?.params?.email;
      const result = await productCollection
        .find({ "seller.email": email })
        .toArray();
      res.send(result);
    });

    app.patch(`/update-product/:id`, async (req, res) => {
      const id = req?.params?.id;
      const product = req?.body;
      const updatedDoc = {
        $set: {
          ...product,
          timeStamp: Date.now(),
        },
      };
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        updatedDoc
      );
      res.send(result);
    });

    app.delete(`/delete-room/:id`, async (req, res) => {
      const { reason } = req?.query;
      const id = req?.params?.id;
      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      return result;
    });

    app.get(`/manage-orders/:email`, async (req, res) => {
      const email = req?.params?.email;
      const result = await bookingCollection
        .find({ "seller.email": email })
        .toArray();
      res.send(result);
    });

    app.patch(`/update-delivery-status/:id`, async (req, res) => {
      const id = req?.params?.id;
      const { deliveryStatus } = req?.body;
      const updatedDoc = {
        $set: {
          deliveryStatus,
          lastUpdatedTime: Date.now(),
        },
      };
      const result = await bookingCollection.updateOne(
        { _id: new ObjectId(id) },
        updatedDoc
      );
      res.send(result);
    });

    // admin dashboard
    app.patch("/update-user-role/:email", async (req, res) => {
      const email = req?.params?.email;
      const { selectedRole } = req?.body;
      const query = { email };
      const updatedDoc = {
        $set: {
          role: selectedRole,
          status: "verified",
          timeStamp: Date.now(),
        },
      };

      const result = await userCollection.updateOne(query, updatedDoc);
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
