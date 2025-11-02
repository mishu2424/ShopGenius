const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto"); // Node 16+

const port = process.env.PORT || 8000;

// --- HOIST COLLECTION HANDLES HERE ---
let productCollection;
let cartCollection;
let userCollection;
let bookingCollection;
let pendingCheckoutCollection;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// payment webhook
// app.post(
//   "/webhooks/stripe",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       switch (event.type) {
//         case "checkout.session.completed": {
//           const session = event.data.object;

//           const paymentIntentId =
//             typeof session.payment_intent === "string"
//               ? session.payment_intent
//               : session.payment_intent?.id;

//           const lineItems = await stripe.checkout.sessions.listLineItems(
//             session.id,
//             { limit: 100 }
//           );
//           const booking = {
//             amount_total: session.amount_total,
//             currency: session?.currency,
//             date: new Date(),
//             transactionId: paymentIntentId,
//             items: lineItems.data.map((li) => ({
//               productBookingId: li?.productId,
//               sold_count: li?.sold_count + li?.quantity,
//               title: li?.title,
//               brand: li?.brand,
//               totalPrice: li?.totalPrice,
//               user: {
//                 name: li?.userName,
//                 email: li?.userEmail,
//                 photoURL: li?.userPhoto,
//               },
//             })),
//             deliveryStatus: "Pending",
//           };

//           await bookingCollection.insertOne(booking);
//           break;
//         }
//         case "payment_intent.succeeded": {
//           // Alternative event if you use direct PI flows.
//           break;
//         }

//         default:
//           // Other events you may care about:
//           // - checkout.session.async_payment_succeeded / failed
//           // - charge.refunded
//           // - payment_intent.payment_failed
//           break;
//       }
//       res.json({ received: true });
//     } catch (err) {
//       console.error("⚠️ Webhook handler error:", err);
//       // Return 200 only if you want Stripe to stop retrying.
//       // If you want Stripe to retry, return 5xx.
//       res.status(500).send("Server error");
//     }

//     // if (event.type === "checkout.session.completed") {
//     //   const session = event.data.object;
//     //   // payment_intent can be string or object depending on expansion
//     //   const piId =
//     //     typeof session.payment_intent === "string"
//     //       ? session.payment_intent
//     //       : session.payment_intent.id;

//     //   // Retrieve any metadata you attached when creating line_items/product_data
//     //   // Then build and save your booking record here
//     //   // e.g., const booking = {..., transactionId: piId, deliveryStatus: 'Pending'}
//     // }

//     // res.json({ received: true });
//   }
// );
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook verify failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // (optional) idempotency guard
      // const exists = await bookingCollection.findOne({
      //   stripeEventId: event.id,
      // });
      // if (exists) return res.json({ received: true, duplicate: true });

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        // your items back from metadata (your exact keys)
        let itemsMeta = [];
        try {
          itemsMeta = JSON.parse(session.metadata?.items || "[]");
        } catch {}

        // (optional) also fetch Stripe-computed line items
        // const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

        const bookingDoc = {
          stripeEventId: event.id,
          stripeSessionId: session.id,
          transactionId: paymentIntentId,
          amount_total: session.amount_total, // in cents
          currency: session.currency,
          payment_status: session.payment_status, // 'paid'
          date: new Date(),
          deliveryStatus: "Pending",
          items: itemsMeta.map((li) => ({
            productBookingId: li.productBookingId,
            title: li.title,
            brand: li.brand,
            image: li.image,
            category: li.category,
            color: li.color,
            // keep your field names consistent:
            totalPrice: li.price, // per-unit price you sent
            quantity: li.quantity,
            seller: {
              name: li.sellerName,
              storeName: li.sellerStore,
              email: li.sellerEmail,
              location: li.sellerLocation,
            },
            user: {
              name: li.userName,
              email: li.userEmail,
              photoURL: li.userPhoto,
            },
          })),
        };

        await bookingCollection.insertOne(bookingDoc);

        // (optional) update product stock / sold_count
        for (const li of itemsMeta) {
          if (!li.productBookingId) continue;
          try {
            await productCollection.updateOne(
              { _id: new ObjectId(li.productBookingId) },
              {
                $inc: {
                  "availability.stock": -Number(li.quantity || 0),
                  sold_count: Number(li.quantity || 0),
                },
              }
            );
          } catch (e) {
            console.error(
              "Stock update failed for",
              li.productBookingId,
              e.message
            );
          }
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).send("Server error");
    }
  }
);

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
    productCollection = client.db("Shop-Genius-db").collection("products");
    cartCollection = client.db("Shop-Genius-db").collection("cart");
    userCollection = client.db("Shop-Genius-db").collection("users");
    bookingCollection = client.db("Shop-Genius-db").collection("bookings");
    pendingCheckoutCollection = client
      .db("Shop-Genius-db")
      .collection("pendingCheckouts");

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
      console.log(id, sold_count);
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

    // checkout-all-payment
    // app.post(`/create-checkout-session`, async (req, res) => {
    //   try {
    //     // console.log('carts',req?.body?.items);
    //     const session = await stripe.checkout.sessions.create({
    //       payment_method_types: ["card"],
    //       mode: "payment",
    //       line_items: req?.body?.items?.map((item) => {
    //         console.log(item?.category);
    //         return {
    //           price_data: {
    //             currency: item?.currency,
    //             product_data: {
    //               name: item?.title,
    //               metadata: {
    //                 productId: item.productBookingId,
    //                 title: item?.title,
    //                 brand: item.brand,
    //                 productImage: item?.image,
    //                 category: item.category,
    //                 color: item.color,
    //                 totalPrice: item?.price,
    //                 sellerName: item?.seller?.name || "",
    //                 sellerStore: item?.seller?.storeName || "",
    //                 sellerEmail: item?.seller?.email || "",
    //                 sellerLocation: item?.seller?.location || "",
    //                 userName: item?.user?.name || "",
    //                 userEmail: item?.user?.email || "",
    //                 userPhoto: item?.user?.photoURL || "",
    //               },
    //             },
    //             unit_amount: parseFloat(item?.price) * 100,
    //           },
    //           quantity: Number(item?.quantity),
    //         };
    //       }),
    //       success_url: `${process.env.FRONT_END_URL}/payment-success`,
    //       cancel_url: `${process.env.FRONT_END_URL}/payment-fail`,
    //     });
    //     res.json({ url: session.url });
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).json({ error: err.message });
    //   }
    // });

    // server: create-checkout-session
    app.post(`/create-checkout-session`, async (req, res) => {
      try {
        const items = Array.isArray(req.body?.items) ? req.body.items : [];

        // 1) create a short token and store items server-side
        const checkoutToken = randomUUID();
        await pendingCheckoutCollection.insertOne({
          token: checkoutToken,
          items,
          createdAt: new Date(),
        });

        // 2) only send tiny metadata to Stripe
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],

          line_items: items.map((item) => ({
            price_data: {
              currency: item.currency || "CAD",
              product_data: { name: item.title },
              unit_amount: parseFloat(item?.price) * 100,
            },
            quantity: Number(item.quantity) || 1,
          })),

          // keep metadata tiny (<500 chars per value!)
          metadata: {
            token: checkoutToken, // ~36 chars
            userEmail: items?.[0]?.user?.email || "", // optional, short
          },

          success_url: `${process.env.FRONT_END_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONT_END_URL}/payment-fail`,
        });

        res.json({ url: session.url });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
    });

    // server: read a completed session
    app.get(`/api/stripe/checkout-session`, async (req, res) => {
      // console.log("hit");
      const { session_id } = req?.query;
      // console.log(session_id);
      if (!session_id)
        return res.status(400).json({ error: "Missing_session_id" });

      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent"], // so you can read session.payment_intent.id
      });

      // ✅ fetch items from your DB using the token you put in metadata
      const token = session?.metadata?.token;
      if (!token)
        return res.status(400).json({ error: "Missing_token_in_metadata" });

      const pending = await pendingCheckoutCollection.findOne({ token });
      if (!pending) {
        return res.status(404).json({ error: "Pending_checkout_not_found" });
      }

      const items = pending.items || [];

      // (optional) Stripe-computed line items, if you want quantity/amount from Stripe too
      const li = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });
      // console.log(session, 'after booking',items);

      res.json({
        session,
        items,
        lineItems: li.data,
      });
    });

    // booking
    app.post("/booking", verifyToken, async (req, res) => {
      const booking = req?.body;
      // console.log(booking);

      if (booking?.source) {
        if (booking?.source === "Product-details") {
          const isExistInCart = await cartCollection.findOne({
            _id: new ObjectId(booking?.productBookingId),
            "userInfo.email": booking?.user?.email,
          });
          // console.log("productfound", isExistInCart);
          if (isExistInCart) {
            await cartCollection.deleteOne({
              _id: new ObjectId(booking?.productBookingId),
              "userInfo.email": booking?.user?.email,
            });
          }
          delete booking?.source;
        } else if (booking?.source === "checkout_success") {
          booking?.items?.forEach(async (item) => {
            const isExistInCart = await cartCollection.findOne({
              productBookingId: item?.productBookingId,
              "userInfo.email": item?.user?.email,
            });
            if (isExistInCart) {
              await cartCollection.deleteOne({
                productBookingId: item?.productBookingId,
                "userInfo.email": item?.user?.email,
              });
            }
            console.log(item);
            const { date, transactionId, currency, deliveryStatus } = booking;
            console.log("from booking", booking);
            const formedDoc = {
              ...item,
              date,
              transactionId,
              currency,
              deliveryStatus,
            };
            console.log(formedDoc);

            const result = await bookingCollection.insertOne(formedDoc);
          });
          return res.send({
            success: true,
            message: "Checkout bookings saved",
          });
        }
      } else {
        console.log("entered", booking);
        const isExistInCart = await cartCollection.findOne({
          _id: new ObjectId(booking?.productBookingId),
          "userInfo.email": booking?.user?.email,
        });
        // console.log("productfound", isExistInCart);
        if (isExistInCart) {
          await cartCollection.deleteOne({
            _id: new ObjectId(booking?.productBookingId),
            "userInfo.email": booking?.user?.email,
          });
        }
      }

      // console.log("came here");
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

    // recently bought products
    app.get(`/recent-bought/:email`, async (req, res) => {
      const email = req?.query?.email;
      const recentBoughtCategories = req?.query?.recentBoughtCat;
      const result = await bookingCollection
        .find({ "user?.email": email })
        .sort({ _id: -1 })
        .limit(4)
        .toArray();

      if(recentBoughtCategories=='false'){
        console.log('entered',recentBoughtCategories);
        return res.send(result);
      }

      // let cats;
      if (recentBoughtCategories=='true' && result.length > 0) {
        const uniqueCategories = [
          ...new Set(result.map((res) => res.category)),
        ];

        if(uniqueCategories.length===0){
          return res.send([]);
        }

        const products=await productCollection.find({category:{$in:uniqueCategories}}).limit(20).toArray();
        // console.log(products);
        return res.send(products)
      }
      
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
      const { cart } = req?.body;
      console.log(cart);
      const cartItem = { ...cart, date: Date.now() };
      // Check if this user already added this product
      console.log(cart?.userInfo);
      const isAlreadyExist = await cartCollection.findOne({
        "userInfo.email": cart?.userInfo?.email,
        productId: cart.productId,
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
      res.send(result);
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
