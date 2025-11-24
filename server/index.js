require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto"); // Node 16+
const { timeStamp, error } = require("console");
const nodemailer = require("nodemailer");
const port = process.env.PORT || 8000;

// --- HOIST COLLECTION HANDLES HERE ---
let productCollection;
let cartCollection;
let userCollection;
let bookingCollection;
let pendingCheckoutCollection;
let cancelCollection;

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://shop-genius-auth.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// payment webhook

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

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }), //<- Raw body (not parsed JSON)
  async (req, res) => {
    const sig = req.headers["stripe-signature"]; // ← Stripe's signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // ← webhook secret

    let event;

    try {
      // Verify: "Is this really from Stripe, or a hacker?"
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(sig);

    // Handling the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log(session);
          // Only handle subscription checkouts

          if (session.mode === "subscription") {
            const userId = session.metadata.userId;
            const userEmail = session.metadata.userEmail;
            const subscriptionId = session.subscription;
            const planType = session.metadata.plan_lookup_key;

            if (userId) {
              await userCollection.updateOne(
                { firebaseUid: userId },
                {
                  $set: {
                    hasSubscription: true,
                    subscriptionId: subscriptionId,
                    subscriptionStatus: "active",
                    subscriptionPlan: planType,
                    subscriptionStartDate: new Date(),
                  },
                },
                { upsert: false }
              );
              console.log(`✅ User ${userId} subscription activated`);
            }
          }
          break;

        case "customer.subscription.created":
          const newSubscription = event.data.object;

          const customerId = newSubscription.customer;

          // Get customer details
          const customer = await stripe.customers.retrieve(customerId);

          // Send welcome email
          await sendEmail(customer.email, {
            subject: "🎉 Welcome to ShopGenius Prime!",
            message: `
              <h2>Welcome to ShopGenius Prime! 🎉</h2>

              <p>Hi${customer.name ? ` ${customer.name}` : ""},</p>

              <p>Thank you for subscribing! You now have access to:</p>

              <ul style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <li>✅ Free Express Delivery on all orders</li>
                <li>✅ Exclusive Member-Only Deals</li>
                <li>✅ Priority Support</li>
                <li>✅ Early Access to new products</li>
              </ul>

              <h3>Getting Started:</h3>
              <ol>
                <li>Browse our exclusive member deals</li>
                <li>Set up delivery preferences</li>
                <li>Explore early access products</li>
              </ol>

              <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                Questions? Reply to this email or contact support@shopgenius.com
              </p>
            `,
          });

          break;

        case "customer.subscription.updated":
          const updatedSubscription = event.data.object;

          console.log(updatedSubscription);

          // Check if user scheduled cancellation
          if (updatedSubscription.cancel_at_period_end) {
            await userCollection.updateOne(
              { subscriptionId: updatedSubscription.id },
              {
                $set: {
                  subscriptionStatus: "scheduled_cancellation",
                  subscriptionEndDate: new Date(
                    updatedSubscription.current_period_end * 1000
                  ),
                  subscriptionUpdatedAt: new Date(),
                },
              }
            );

            const customerDoc = await userCollection.findOne({
              subscriptionId: updatedSubscription.id,
            });
            if (customerDoc?.email) {
              const endDate = new Date(
                updatedSubscription.current_period_end * 1000
              ).toLocaleDateString();

              await sendEmail(customerDoc.email, {
                subject: "⚠️ Your ShopGenius Premium Will End Soon",
                message: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
                  <h2 style="color: #d35400; margin-bottom: 10px;">Your Subscription Is Scheduled to End</h2>

                  <p>Hi${customerDoc.name ? ` ${customerDoc.name}` : ""},</p>

                  <p>
                    This is a quick update to let you know that your 
                    <strong>ShopGenius Premium</strong> subscription 
                    has been <strong>scheduled for cancellation</strong>.
                  </p>

                  <p>
                    You’ll continue to enjoy all Premium benefits until:
                  </p>

                  <p style="font-size: 18px; font-weight: bold; color: #2980b9;">
                    ${endDate}
                  </p>

                  <hr style="margin: 20px 0;" />

                  <h3 style="margin-bottom: 8px;">Until then, you still have access to:</h3>
                  <ul style="background: #f4f6f7; padding: 15px 20px; border-radius: 8px; line-height: 1.7;">
                    <li>🚚 <strong>Fast delivery</strong> on eligible items</li>
                    <li>🔥 <strong>Member-only deals</strong> and lightning offers</li>
                    <li>⭐ <strong>Priority support</strong> for your orders</li>
                    <li>🔔 <strong>Early access</strong> to new drops and restocks</li>
                  </ul>

                  <p style="margin-top: 20px;">
                    Changed your mind? You can <strong>keep your benefits</strong> by reactivating
                    your subscription before this date.
                  </p>

                  <p style="text-align: center; margin-top: 15px;">
                    <a href="${process.env.FRONT_END_URL}"
                       style="background: #3498db; color: #fff; padding: 12px 24px; 
                       text-decoration: none; border-radius: 6px; display: inline-block;">
                      Reactivate ShopGenius Premium
                    </a>
                  </p>

                  <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">
                    If you didn’t request this change or have questions, reply to this email 
                    or contact our support team. We’re happy to help 💙
                  </p>
                </div>
                `,
              });
            }

            break;
          }

          // Check if user reactivated (was scheduled, now not)
          // We can detect this by checking if status is active and cancel_at_period_end is false
          const existingUser = await userCollection.findOne({
            subscriptionId: updatedSubscription.id,
          });

          if (
            existingUser?.subscriptionStatus === "scheduled_cancellation" &&
            !updatedSubscription.cancel_at_period_end &&
            updatedSubscription.status === "active"
          ) {
            // user reactivated their subscription
            await userCollection.updateOne(
              { subscriptionId: updatedSubscription.id },
              {
                $set: {
                  subscriptionStatus: "active",
                  subscriptionEndDate: null,
                  subscriptionUpdatedAt: new Date(),
                  subscriptionReactivatedAt: new Date(),
                },
              }
            );

            // Send welcome email
            await sendEmail(existingUser.email, {
              subject: "🎉 Reactivation Successful!",
              message: `
                <p>Your reactivation has been successfully completed!!!</p>
              `,
            });
            break;
          }

          // Otherwise, handle plan
          // Get the new price ID
          const newPrice = updatedSubscription.items.data[0].price;

          // Determine which plan it is
          let newPlanType;
          if (newPrice.id === process.env.STRIPE_YEARLY_PRICE_ID) {
            newPlanType = "standard_yearly";
          } else if (newPrice.id === process.env.STRIPE_MONTHLY_PRICE_ID) {
            newPlanType = "standard_monthly";
          } else {
            // Unknown price ID - log it but don't fail
            console.warn("Unknown price ID:", newPrice.id);
            newPlanType = null;
          }

          // Update database
          const updateFields = {
            subscriptionStatus: updatedSubscription.status,
            hasSubscription: updatedSubscription.status === "active",
            subscriptionUpdatedAt: new Date(),
          };

          if (newPlanType) {
            updateFields.subscriptionPlan = newPlanType;
            updateFields.changedPlanAt = new Date();
          }

          // update database
          await userCollection.updateOne(
            { subscriptionId: updatedSubscription.id },
            {
              $set: updateFields,
            }
          );

          await sendEmail(existingUser?.email, {
            subject: "🎉 Plan changed Successfully!",
            message: `
                <p>Your plan has been successfully changed!!!</p>
              `,
          });

          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;

          // Find user and mark subscription as inactive
          await userCollection.updateOne(
            { subscriptionId: deletedSubscription.id },
            {
              $set: {
                hasSubscription: false,
                subscriptionStatus: "cancelled",
                subscriptionEndDate: new Date(),
              },
            }
          );

          // Fetch user to email
          const customerDoc = await userCollection.findOne({
            subscriptionId: deletedSubscription.id,
          });

          if (customerDoc?.email) {
            await sendEmail(customerDoc.email, {
              subject: "Your ShopGenius Premium Has Ended",
              message: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
                  <h2 style="color: #c0392b; margin-bottom: 10px;">Your Premium Subscription Has Ended</h2>

                  <p>Hi${customerDoc.name ? ` ${customerDoc.name}` : ""},</p>

                  <p>
                    This email confirms that your <strong>ShopGenius Premium</strong> subscription 
                    has now been <strong>cancelled</strong>.
                  </p>

                  <p>
                    You’ll no longer have access to Premium benefits such as:
                  </p>

                  <ul style="background: #fdf2f2; padding: 15px 20px; border-radius: 8px; line-height: 1.7;">
                    <li>🚫 Free express delivery on eligible orders</li>
                    <li>🚫 Member-only deals and lightning discounts</li>
                    <li>🚫 Priority customer support</li>
                    <li>🚫 Early access to exclusive product drops</li>
                  </ul>

                  <p style="margin-top: 20px;">
                    We’re grateful you tried ShopGenius Premium and hope it made your shopping easier and more fun.
                    You’re always welcome to come back anytime.
                  </p>

                  <p style="text-align: center; margin-top: 15px;">
                    <a href="${process.env.FRONT_END_URL}/premium"
                       style="background: #3498db; color: #fff; padding: 12px 24px; 
                       text-decoration: none; border-radius: 6px; display: inline-block;">
                      Restart Premium Anytime
                    </a>
                  </p>

                  <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">
                    If this cancellation was a mistake or you didn’t authorize it, please contact us immediately.
                  </p>
                </div>
                `,
            });
          }
          console.log(`✅ Subscription ${deletedSubscription.id} cancelled`);
          break;

        // Send Payment Receipt Email
        case "invoice.payment_succeeded":
          const invoice = event.data.object;

          const customerEmail = invoice.customer_email;
          const amountPaid = (invoice.amount_paid / 100).toFixed(2); //convert cents ro dollars
          const currency = invoice.currency.toUpperCase();
          const invoiceUrl = invoice.hosted_invoice_url; //Link to Stripe invoice
          const invoiceNumber = invoice.number;

          //Update Payment History in User Document
          await userCollection.updateOne(
            { subscriptionId: invoice.subscription },
            {
              $push: {
                paymentHistory: {
                  invoiceId: invoice.id,
                  amount: invoice.amount_paid / 100,
                  currency: invoice.currency,
                  date: new Date(invoice.created * 1000),
                  invoiceUrl: invoiceUrl,
                },
              },
              $set: {
                lastPaymentDate: new Date(invoice.created * 1000),
                lastPaymentAmount: invoice.amount_paid / 100,
              },
            }
          );

          //send receipt email
          await sendEmail(customerEmail, {
            subject: `Payment Receipt - Invoice ${invoiceNumber}`,
            message: `
              <p>Thank you for your payment!</p>
              <p><strong>Amount Paid:</strong> ${currency} $${amountPaid}</p>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(
                invoice.created * 1000
              ).toLocaleDateString()}</p>
              <p><a href="${invoiceUrl}">View Invoice</a></p>
              <hr>
              <p>Your ShopGenius Prime subscription is active!</p>
            `,
          });

          break;

        // Send Payment Failed Email with Action Steps
        case "invoice.payment_failed":
          const failedInvoice = event.data.object;

          const customerEmailId = failedInvoice.customer_email;
          const amountDue = (failedInvoice.amount_due / 100).toFixed(2);
          const attemptCount = failedInvoice.attempt_count;
          const nextPaymentAttempt = failedInvoice.next_payment_attempt;
          // Send urgent email
          await sendEmail(customerEmailId, {
            subject: "⚠️ Payment Failed - Action Required",
            message: `
              <h2 style="color: #e74c3c;">Payment Failed ❌</h2>
              <p>We couldn't process your payment for ShopGenius Prime.</p>

              <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p><strong>Amount Due:</strong> $${amountDue}</p>
                <p><strong>Attempt:</strong> ${attemptCount} of 4</p>
                ${
                  nextPaymentAttempt
                    ? `<p><strong>Next Retry:</strong> ${new Date(
                        nextPaymentAttempt * 1000
                      ).toLocaleDateString()}</p>`
                    : ""
                }
              </div>

              <p><strong>What to do:</strong></p>
              <ol>
                <li>Update your payment method</li>
                <li>Ensure sufficient funds</li>
                <li>Check card expiration date</li>
              </ol>

              <p><a href="https://yoursite.com/billing" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Payment Method</a></p>

              <p style="color: #e74c3c; font-size: 12px; margin-top: 20px;">
                <strong>Important:</strong> If payment fails after 4 attempts, your subscription will be cancelled.
              </p>
            `,
          });

          // Update user status in database
          // Suspend Premium Features After Multiple Failures
          if (attemptCount >= 3) {
            await userCollection.updateOne(
              { subscriptionId: failedInvoice.subscription },
              {
                $set: {
                  hasSubscription: false, //suspend access
                  subscriptionStatus: "suspended",
                  suspendedDate: new Date(),
                  suspensionReason: "Payment failed after multiple attempts",
                },
              }
            );

            // Send final warning
            await sendEmail(failedInvoice.customer_email, {
              subject: "🚨 Subscription Suspended - Immediate Action Required",
              message: `
                <h2 style="color: #c0392b;">Subscription Suspended</h2>
                <p>Your ShopGenius Prime subscription has been suspended due to failed payments.</p>
                <p><strong>Update your payment method now to restore access.</strong></p>
                <p><a href="https://yoursite.com/billing">Update Payment Method</a></p>
              `,
            });
          } else {
            // Implement Grace Period
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

            await userCollection.updateOne(
              { subscriptionId: failedInvoice.subscription },
              {
                $set: {
                  subscriptionStatus: "past_due",
                  paymentFailedCount: attemptCount,
                  gracePeriodEnd: gracePeriodEnd,
                  lastPaymentError:
                    failedInvoice.last_payment_error?.message ||
                    "Payment failed",
                  lastPaymentErrorDate: new Date(),
                },
              }
            );
          }

          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error processing webhook:", {
        eventType: event.type,
        eventId: event.id,
        error: err.message,
        stack: err.stack,
      });
      res.status(500).send("Webhook processing failed");
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

// send email using nodemailer
const sendEmail = async (emailAddress, emailData) => {
  // console.log("Email address", emailAddress, "Email data", emailData);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.TRANSPORT_EMAIL,
      pass: process.env.TRANSPORT_PASS,
    },
  });

  try {
    await transporter.verify();
    const mailBody = {
      from: `"ShopGenius" <${process.env.TRANSPORT_EMAIL}>`,
      to: emailAddress,
      subject: emailData?.subject,
      html: emailData?.message,
    };
    const info = await transporter.sendMail(mailBody);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
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
    cancelCollection = client
      .db("Shop-Genius-db")
      .collection("Orders-cancellation");

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

    const verifyAdminOrSeller = async (req, res, next) => {
      const { email } = req?.user;

      const result = await userCollection.findOne({ email });
      if (!result || result.role === "user") {
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
      console.log(id);
      const result = await productCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/discounted-products", async (req, res) => {
      const result = await productCollection
        .find({ "discount.active": true })
        .toArray();
      res.send(result);
    });

    app.post(`/products`, verifyToken, verifySeller, async (req, res) => {
      const product = req?.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.patch(`/update-product-sold-count/:id`, async (req, res) => {
      const id = req?.params?.id;
      const { sold_count, orderedQuantity, source } = req?.body || {};
      const existingProduct = await productCollection.findOne({
        _id: new ObjectId(id),
      });
      if (source === "booking-data") {
        if (existingProduct) {
          const updatedSTock =
            existingProduct?.availability?.stock + Number(orderedQuantity);
          let updatedDoc;
          if (0 < updatedSTock < 50) {
            updatedDoc = {
              $set: {
                sold_count: existingProduct?.sold_count - Number(sold_count),
                "availability.stock": updatedSTock,
                "availability.status": "low_stock",
                "availability.available": true,
              },
            };
          }
          if (updatedSTock > 50) {
            updatedDoc = {
              $set: {
                sold_count: existingProduct?.sold_count - Number(sold_count),
                "availability.stock": updatedSTock,
                "availability.status": "in_stock",
                "availability.available": true,
              },
            };
          }
          const result = await productCollection.updateOne(
            { _id: new ObjectId(id) },
            updatedDoc
          );
          res.send(result);
        }
        return;
      }
      if (existingProduct) {
        const updatedSTock =
          existingProduct?.availability?.stock - Number(orderedQuantity);
        let updatedDoc;
        if (updatedSTock === 0) {
          updatedDoc = {
            $set: {
              sold_count: existingProduct?.sold_count + Number(sold_count),
              "availability.stock": updatedSTock,
              "availability.available": false,
              "availability.status": "out_of_stock",
            },
          };
        }
        if (updatedSTock < 50) {
          updatedDoc = {
            $set: {
              sold_count: existingProduct?.sold_count + Number(sold_count),
              "availability.stock": updatedSTock,
              "availability.status": "low_stock",
              "availability.available": true,
            },
          };
        }
        if (updatedSTock > 50) {
          updatedDoc = {
            $set: {
              sold_count: existingProduct?.sold_count + Number(sold_count),
              "availability.stock": updatedSTock,
              "availability.available": true,
              "availability.status": "in_stock",
            },
          };
        }
        const result = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          updatedDoc
        );
        res.send(result);
      }
    });

    //recently-visited product
    app.get("/user/recently-viewed", verifyToken, async (req, res) => {
      try {
        const { email } = req?.user;

        if (!email) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await userCollection.findOne(
          { email },
          { projection: { recentlyViewed: 1 } }
        );

        if (!user || !user.recentlyViewed || user.recentlyViewed.length === 0) {
          return res.json([]);
        }

        const productIds = user.recentlyViewed.map(
          (item) => new ObjectId(item.productId)
        );

        const products = await productCollection
          .find({ _id: { $in: productIds } })
          .toArray();

        //merge product data with view timeStamp, maintain order
        const result = user?.recentlyViewed
          .map((viewedItem) => {
            const product = products.find((p) => {
              return p._id.toString() === viewedItem.productId;
            });

            if (product) {
              return {
                ...product,
                viewedAt: viewedItem.viewedAt,
              };
            }
            return null;
          })
          .filter(Boolean);

        res.json(result);
      } catch (err) {
        console.error("Error fetching recently viewed:", err.message);
        res.status(500).json({ message: "Failed to fetch recently viewed" });
      }
    });

    //add a product to recently viewed
    app.post("/user/recently-viewed", verifyToken, async (req, res) => {
      try {
        const { email } = req?.user;
        const { productId, viewedAt } = req.body;

        if (!email) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (!productId) {
          return res.status(400).json({ message: "Product ID is required" });
        }

        await userCollection.updateOne(
          { email },
          {
            $pull: {
              recentlyViewed: { productId: productId },
            },
          }
        );

        //add to the beginning of the array
        const result = await userCollection.updateOne(
          { email },
          {
            $push: {
              recentlyViewed: {
                $each: [{ productId, viewedAt: viewedAt || new Date() }],
                $position: 0, //add to beginning
                $slice: 20, // keep only first 20 items
              },
            },
          },
          { upsert: true } // Create user document if doesn't exist
        );

        res.json({
          success: true,
          message: "Added to recently viewed",
          result,
        });
      } catch (err) {
        console.error("Error adding recently viewed:", err.message);
        res.status(500).json({ message: "Failed to fetch recently viewed" });
      }
    });

    // POST - Sync localStorage data to backend (when user logs in)
    app.post("/user/sync-recently-viewed", verifyToken, async (req, res) => {
      try {
        const { email } = req?.user;
        const { products } = req?.body;

        if (!email) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (!products || !Array.isArray(products)) {
          return res.status(400).json({ message: "Invalid products data" });
        }

        //get existing recently viewed
        const user = await userCollection.findOne(
          { email },
          { projection: { recentlyViewed: 1 } }
        );

        const existingViewed = user?.recentlyViewed || [];

        //convert localstorage format to DB format
        const newViewed = products.map((p) => ({
          productId: p.productId,
          viewedAt: p.viewedAt || new Date(),
        }));

        //Merge: Keep existing, add new ones that don't exist
        const merged = [...newViewed];

        existingViewed.forEach((existing) => {
          // if it already exists in the db or not
          const alreadyExists = merged.some(
            (item) => item.productId === existing.productId
          );
          // if it does not push the new data
          if (!alreadyExists) {
            merged.push(existing);
          }
        });

        // Sort by viewedAt (most recent first) and limit to 20
        merged.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
        const limited = merged.slice(0, 20);

        // Update user document
        await userCollection.updateOne(
          { email },
          { $set: { recentlyViewed: limited } },
          { upsert: true }
        );

        res.json({
          success: true,
          message: "Recently viewed synced",
          count: limited.length,
        });
      } catch (err) {
        console.error("Error syncing recently viewed:", err.message);
        res.status(500).json({ message: "Failed to sync recently viewed" });
      }
    });

    // user-subscription
    app.get(`/user/subscription/:email`, verifyToken, async (req, res) => {
      const { email } = req?.params;
      // console.log("hit");
      const isSubscribed = await userCollection.findOne(
        { email },
        {
          projection: {
            hasSubscription: 1,
            subscriptionPlan: 1,
            subscriptionId: 1,
            subscriptionStatus: 1,
            subscriptionEndDate: 1,
            subscriptionStartDate: 1,
          },
        }
      );
      // console.log(isSubscribed);
      return res.send(isSubscribed);
    });

    // change-subscription
    app.post("/change-subscription-plan", verifyToken, async (req, res) => {
      try {
        const { subscriptionId, newPlanType } = req?.body;

        // validate inputs
        if (!subscriptionId || !newPlanType) {
          return res.status(400).json({
            error: "Missing subscriptionId or newPlanType",
          });
        }

        let newPriceId;
        let planName;

        if (newPlanType === "standard_yearly") {
          newPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
          planName = "Annual Plan";
        } else if (newPlanType === "standard_monthly") {
          newPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
          planName = "Monthly Plan";
        } else {
          return res.status(400).json({
            error: `Invalid plan type: ${newPlanType}`,
          });
        }

        // Validate price ID exists
        if (!newPriceId) {
          return res.status(500).json({
            error: `Price ID not configured for ${newPlanType}`,
          });
        }

        // Step 1: Get the current subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        // Check if subscription exists and is active
        if (!subscription || subscription.status !== "active") {
          return res.status(400).json({
            error: "Subscription not found or not active",
          });
        }

        // console.log("subs", subscription);

        // Step 2: Get the current subscription item (the thing being billed)
        const subscriptionItemId = subscription.items.data[0].id;

        // console.log(subscription);

        // Step 3: Update the subscription with new price
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            items: [
              {
                id: subscriptionItemId, //update existing item
                price: newPriceId, //New price ID (yearly)
              },
            ],
            proration_behavior: "create_prorations", // handle billing fairly
          }
        );

        // Step 4: Update your database
        await userCollection.updateOne(
          { subscriptionId: subscriptionId },
          {
            $set: {
              subscriptionPlan: newPlanType,
              subscriptionUpdatedAt: new Date(),
              changedPlanAt: new Date(),
            },
          }
        );

        res.json({
          success: true,
          message: `Plan changed to ${planName}`,
          subscription: {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            plan: newPlanType,
            current_period_end: new Date(
              updatedSubscription.current_period_end * 1000
            ),
          },
        });
      } catch (err) {
        console.error("Error changing subscription plan:", err);
        res
          .status(500)
          .json({ error: err.message || "Failed to change the plan type" });
      }
    });

    // reactive-subscription
    app.post("/reactivate-subscription", verifyToken, async (req, res) => {
      try {
        const { subscriptionId } = req?.body;

        if (!subscriptionId) {
          return res.status(400).json({
            error: "Missing subscriptionId",
          });
        }

        // Get current subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        // Check if it's actually scheduled for cancellation
        if (!subscription.cancel_at_period_end) {
          return res.status(400).json({
            error: "Subscription is not scheduled for cancellation",
          });
        }

        // Reactivate: Remove the cancellation
        const updatedSub = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });

        // Update database
        await userCollection.updateOne(
          { subscriptionId },
          {
            $set: {
              subscriptionStatus: "active",
              subscriptionEndDate: new Date(
                updatedSubscription.current_period_end * 1000
              ),
              subscriptionUpdatedAt: new Date(),
              subscriptionReactivatedAt: new Date(),
            },
          }
        );

        res.json({
          success: true,
          message: "Subscription reactivated successfully",
          subscription: {
            id: updatedSub.id,
            status: updatedSub.status,
            cancel_at_period_end: updatedSub.cancel_at_period_end,
            current_period_end: new Date(updatedSub.current_period_end * 1000),
          },
        });
      } catch (err) {
        console.error("Reactivation error:", err);
        res.status(500).json({
          error: err.message || "Failed to reactivate subscription",
        });
      }
    });

    // cancel-subscription
    app.post("/cancel-subscription", async (req, res) => {
      const { subscriptionId } = req?.body;
      const subscriptionInfo = await stripe.subscriptions.retrieve(
        subscriptionId
      );
      console.log("sub info", subscriptionInfo);
      // Start time
      const start = subscriptionInfo.start_date; // unix seconds
      const now = Math.floor(Date.now() / 1000);
      const threeDays = 3 * 24 * 60 * 60;
      console.log("Start", start, "Now", now);

      if (now - start <= threeDays) {
        //find latest invoice
        const latestInvoiceId = subscriptionInfo.latest_invoice;
        const invoice = await stripe.invoices.retrieve(latestInvoiceId);

        //refund the invoice's payment
        const paymentIntentId = invoice.payment_intent;
        if (paymentIntentId) {
          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });
        }
        console.log("invoice", invoice);

        //cancel immediately
        await stripe.subscriptions.cancel(subscriptionId);

        // update the db
        await userCollection.updateOne(
          { subscriptionId },
          {
            $set: {
              hasSubscription: false,
              subscriptionStatus: "cancelled_refunded",
              subscriptionEndDate: new Date(),
            },
          }
        );
      } else if (now - start > threeDays) {
        const updatedSub = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

        // storing this in db to show user probable cancellation date
        await userCollection.updateOne(
          { subscriptionId },
          {
            $set: {
              subscriptionStatus: "scheduled_cancellation",
              subscriptionEndDate: new Date(
                updatedSub.current_period_end * 1000
              ),
            },
          }
        );
      }
    });

    // payments
    /*     app.post("/create-payment-intent", async (req, res) => {
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
    }); */

    // server: create-checkout-session
    app.post(`/create-checkout-session`, verifyToken, async (req, res) => {
      try {
        const items = Array.isArray(req.body?.items)
          ? req.body.items
          : typeof req?.body?.items === "object" && req.body.items !== null
          ? [req?.body?.items]
          : [];
        console.log("items received", items);

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

          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: `Order Invoice`,
              footer: "Thank you for your purchase!",
              metadata: {
                order_token: checkoutToken,
              },
            },
          },

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

      const existingBooking = await bookingCollection.findOne({
        sessionId: session_id,
      });

      if (existingBooking) {
        return res.json({
          alreadyProcessed: true,
          booking: existingBooking,
        });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent", "invoice"], // so you can read session.payment_intent.id
      });

      console.log("ses found", session);

      // fetch items from DB using the token put in metadata
      const token = session?.metadata?.token;
      if (!token)
        return res.status(400).json({ error: "Missing_token_in_metadata" });

      const pending = await pendingCheckoutCollection.findOne({ token });
      if (!pending) {
        return res.status(404).json({ error: "Pending_checkout_not_found" });
      }

      const items = pending.items || [];

      // Get invoice data if available
      let invoiceData = null;
      if (session.invoice) {
        invoiceData = {
          payment_intent_id: session.payment_intent.id,
          invoiceId: session.invoice,
          invoice_pdf: session.invoice.invoice_pdf,
          hosted_invoice_url: session.invoice.hosted_invoice_url,
          email: session.customer_details.email,
          status: session.payment_intent.status,
          amount_paid: session.amount_total,
          created: session.payment_intent.created,
        };
      }

      // (optional) Stripe-computed line items, if you want quantity/amount from Stripe too
      const li = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });
      console.log(session, "after booking", items);

      res.json({
        session,
        items,
        lineItems: li.data,
        invoice: invoiceData,
      });
    });

    // for monthly subscription
    app.post("/create-subscription-checkout", async (req, res) => {
      try {
        const { userId, userEmail, planType } = req.body;

        const lookupKey = planType || "";

        let priceId;
        let planName;

        if (planType === "standard_yearly") {
          priceId = process.env.STRIPE_YEARLY_PRICE_ID;
          planName = "Annual Plan";
        } else if (planType === "standard_monthly") {
          priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
          planName = "Monthly Plan";
        } else {
          return res.status(400).send({ message: "Something went wrong!!" });
        }

        if (!priceId) {
          return res.status(400).json({
            error: "Price ID not configured. Please contact support.",
          });
        }

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],

          customer_email: userEmail,

          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],

          metadata: {
            userId: userId || "guest",
            userEmail: userEmail || "",
            plan_lookup_key: lookupKey, // Store for your reference
            plan_name: planName,
          },

          success_url: `${process.env.FRONT_END_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONT_END_URL}`,
        });

        res.json({ url: session.url, sessionId: session.id });
      } catch (error) {
        console.error("Subscription checkout error: ", error);
        res.status(500).json({ error: error.message });
      }
    });

    // booking
    app.post("/booking", verifyToken, async (req, res) => {
      const booking = req?.body;

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
          console.log("start");
          booking?.items?.forEach(async (item) => {
            // console.log("booked item boom", item);
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
            // console.log(item);
            const {
              sessionId,
              date,
              transactionId,
              currency,
              deliveryStatus,
              invoice,
              returningEndDate,
            } = booking;
            console.log("from booking", booking, "date", date);
            const formedDoc = {
              ...item,
              sessionId,
              date,
              transactionId,
              returningEndDate,
              currency,
              deliveryStatus,
              invoice,
            };
            const result = await bookingCollection.insertOne(formedDoc);
            console.log("result", result);
          });

          console.log("booking items", booking?.items);

          // console.log(booking);

          // guest email confirmation
          sendEmail(booking?.items[0]?.user?.email, {
            subject: "Successfully booked!",
            message: `You have successfully bought the item. Transaction id : ${booking?.transactionId}`,
          });

          sendEmail(booking?.items[0]?.seller?.email, {
            subject: `Product Update`,
            message: `${booking?.items[0]?.user?.email} has bought your product.`,
          });

          return res.send({
            success: true,
            message: "Checkout bookings saved",
          });
        }
      } else {
        // console.log("entered", booking);
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
      console.log(booking);
      sendEmail(booking?.user?.email, {
        subject: "Congratulations!",
        message: `You have successfully bought the item ${booking?.user?.name}!Transaction id:${booking?.transactionId}`,
      });

      sendEmail(booking?.seller?.email, {
        subject: `Product Update`,
        message: `${booking?.user?.email} has bought your product.`,
      });

      console.log("hit");

      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // popular products
    app.get(`/popular-products`, async (req, res) => {
      const result = await productCollection.find({ popular: true }).toArray();
      res.send(result);
    });

    // recently bought products
    app.get(`/recent-bought`, verifyToken, async (req, res) => {
      const email = req?.user?.email;
      console.log(email);
      const recentBoughtCategories = req?.query?.recentBoughtCat;
      const result = await bookingCollection
        .find({ "user.email": email })
        .sort({ _id: -1 })
        .limit(4)
        .toArray();
      // console.log(result);

      if (recentBoughtCategories == "false") {
        // Get unique items based on productBookingId (keeps most recent due to sort)
        const uniqueItems = result.filter(
          (item, index, self) =>
            index ===
            self.findIndex((t) => t.productBookingId === item.productBookingId)
        );

        // Limit to 4 after filtering for uniqueness
        return res.send(uniqueItems.slice(0, 4));
      }

      // let cats;
      if (result.length > 0) {
        if (recentBoughtCategories == "true") {
          console.log("result", result);
          const uniqueCategories = [
            ...new Set(result.map((res) => res.category)),
          ];

          if (uniqueCategories.length === 0) {
            return res.send([]);
          }

          const products = await productCollection
            .find({ category: { $in: uniqueCategories } })
            .limit(20)
            .toArray();
          // console.log(products);
          return res.send(products);
        }
      } else {
        return res.send([]);
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
    app.get(`/cart`, verifyToken, async (req, res) => {
      const { email } = req?.query;
      const result = await cartCollection
        .find({ "userInfo.email": email })
        .toArray();

      const totalCartItems = await cartCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalItems: { $sum: "$quantity" },
            },
          },
        ])
        .toArray();

      console.log("all carts", result, "totalCartItems", totalCartItems);
      res.send({ result, totalCartItems: totalCartItems[0]?.totalItems });
    });

    app.post(`/cart`, verifyToken, async (req, res) => {
      const { cart } = req?.body;
      console.log("cart", cart);
      const cartItem = { ...cart, updatedAt: Date.now() };
      // Check if this user already added this product
      console.log(cartItem);
      const isAlreadyExist = await cartCollection.findOne({
        "userInfo.email": cart?.userInfo?.email,
        productId: cart.productId,
      });

      if (isAlreadyExist) {
        console.log("alreadyexists", isAlreadyExist);
        const strId = `${isAlreadyExist?._id}`;
        if (cart?.source === "returnsOrders") {
          if (cart?.quantity > isAlreadyExist?.quantity) {
            const result = await cartCollection.updateOne(
              {
                _id: new ObjectId(strId),
              },
              {
                $set: {
                  quantity: cart?.quantity,
                  totalPrice:
                    isAlreadyExist?.totalPrice +
                    (cart?.quantity - isAlreadyExist?.quantity) * cart?.price,
                  updatedAt: Date.now(),
                },
              }
            );

            return res.send(result);
          } else if (cart?.quantity < isAlreadyExist?.quantity) {
            const result = await cartCollection.updateOne(
              {
                _id: new ObjectId(strId),
              },
              {
                $set: {
                  quantity: cart?.quantity,
                  totalPrice:
                    isAlreadyExist?.totalPrice -
                    (isAlreadyExist?.quantity - cart?.quantity) * cart?.price,
                  updatedAt: Date.now(),
                },
              }
            );

            return res.send(result);
          }
        }
        const result = await cartCollection.updateOne(
          {
            _id: new ObjectId(strId),
          },
          {
            $set: {
              quantity: isAlreadyExist?.quantity + cart?.quantity,
              totalPrice: isAlreadyExist?.totalPrice + cart?.totalPrice,
              updatedAt: Date.now(),
            },
          }
        );
        return res.send(result);
      }

      /*       if (isAlreadyExist) {
        return res.status(200).json({
          message: "Item already exists in cart",
          inserted: false,
          existingItemId: isAlreadyExist._id,
        });
      } */
      const data = await cartCollection.insertOne(cartItem);
      res.send(data);
    });

    app.delete(`/cart/:id`, verifyToken, async (req, res) => {
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
      console.log("user found: ", user);
      const query = { email: user?.email };
      const options = { upsert: true };
      const userFound = await userCollection.findOne(query);
      if (userFound) {
        if (user?.status === "requested") {
          const updateUser = await userCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(updateUser);
        } else if (user?.status === "verified") {
          if (!userFound?.firebaseUid) {
            const updatedUserDoc = await userCollection.updateOne(query, {
              $set: { firebaseUid: user?.firebaseUid },
            });
            return res.send(updatedUserDoc);
          }
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

    // guest-stats
    app.get("/guest-stats", verifyToken, async (req, res) => {
      const { email } = req?.user;

      const bookings = await bookingCollection
        .find(
          { "user.email": email },
          {
            projection: {
              date: 1,
              totalPrice: 1,
            },
          }
        )
        .toArray();

      const { timeStamp } = await userCollection.findOne(
        { email },
        {
          projection: {
            timeStamp: 1,
          },
        }
      );

      const chartData = bookings?.map((booking) => {
        const day = new Date(booking?.date).getDate();
        const month = new Date(booking?.date).getMonth() + 1;
        const data = [`${day}/${month}`, Number(booking?.totalPrice)];
        return data;
      });

      chartData.unshift(["Day", "Sales"]);

      const totalSales = bookings.reduce(
        (acc, booking) => acc + Number(booking?.totalPrice),
        0
      );

      res.send({
        totalBookings: bookings.length,
        timeStamp,
        totalSales,
        chartData,
      });
    });

    app.get(`/my-orders/:email`, verifyToken, async (req, res) => {
      const email = req?.params?.email;
      console.log(req?.params);
      const result = await bookingCollection
        .find({ "user.email": email })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.get(`/order-summary/:id`, verifyToken, async (req, res) => {
      const { id } = req?.params;
      console.log(id);
      const result = await bookingCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete(`/cancel-order/:id`, verifyToken, async (req, res) => {
      const id = req?.params?.id;
      const { reason } = req?.query;
      const savedOrder = await bookingCollection.findOne({
        _id: new ObjectId(id),
      });

      const canceledOrder = {
        ...savedOrder,
        cancelOrderId: `${savedOrder._id}`,
        canceledAt: Date.now(),
        cancellationReason: reason ? reason : "unknown",
        returnedStatus:
          savedOrder?.deliveryStatus === "delivered" ? false : true,
      };
      delete canceledOrder?._id;
      await cancelCollection.insertOne(canceledOrder);

      // deleting
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });

      sendEmail(canceledOrder?.user?.email, {
        subject: "Cancellation!",
        message: `You have successfully cancelled the order. Transaction id : ${canceledOrder?.transactionId}`,
      });
      res.send(result);
    });

    // seller dashboard
    // stats

    // seller-stats
    app.get("/seller-stats", verifyToken, verifySeller, async (req, res) => {
      const { email } = req?.user;

      const totalProducts = await productCollection.countDocuments({
        "seller.email": email,
      });

      const bookings = await bookingCollection
        .find(
          { "seller.email": email },
          {
            projection: {
              date: 1,
              title: 1,
              sold_count: 1,
              totalPrice: 1,
            },
          }
        )
        .toArray();

      const { timeStamp } = await userCollection.findOne(
        { email },
        {
          projection: {
            timeStamp: 1,
          },
        }
      );

      // [
      //   ["Date", "Total Sales", "Sold Count", { role: "tooltip" }],
      //   [new Date(2025, 0, 1), 1499, 50, "Dior Sauvage"],
      //   [new Date(2025, 0, 2), 2399, 75, "Bleu de Chanel"],
      //   [new Date(2025, 0, 3), 899, 30, "Versace Eros"],
      //   [new Date(2025, 0, 4), 1199, 45, "Prada Luna Rossa"],
      // ];

      // header: date, Total Sales, tooltip for sales, Sold Count, tooltip for sold
      const chartData = [
        [
          "Date",
          "Total Sales",
          { role: "tooltip", type: "string", p: { html: true } },
          "Sold Count",
          { role: "tooltip", type: "string", p: { html: true } },
        ],
        // rows...
        // ["01/11", 3199.98, "<b>iPhone 14…</b><br/>Sales: $3,199.98",
        //             610,    "<b>iPhone 14…</b><br/>Sold: 610"],
      ];

      const rows = bookings.map((b) => {
        const day = new Date(b?.date).getDate();
        const month = new Date(b?.date).getMonth() + 1;
        const dateLabel = `${day}/${month}`;

        const sales = Number(b.totalPrice || 0);
        const sold = Number(b.sold_count || 0);
        const title = b.title ?? "";

        const salesTip = `<div><b>${title}</b><br/>Sales: $${sales.toLocaleString()}</div>`;
        const soldTip = `<div><b>${title}</b><br/>Sold: ${sold.toLocaleString()}</div>`;

        return [dateLabel, sales, salesTip, sold, soldTip];
      });

      chartData.push(...rows);

      const totalSales = bookings.reduce(
        (acc, booking) => acc + Number(booking?.totalPrice),
        0
      );

      res.send({
        totalProducts: totalProducts,
        totalBookings: bookings.length,
        timeStamp,
        totalSales,
        chartData,
      });
    });

    app.get(
      `/my-products/:email`,
      verifyToken,
      verifySeller,
      async (req, res) => {
        const email = req?.params?.email;
        const result = await productCollection
          .find({ "seller.email": email })
          .toArray();
        res.send(result);
      }
    );

    app.patch(
      `/update-product/:id`,
      verifyToken,
      verifySeller,
      async (req, res) => {
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
      }
    );

    app.delete(
      `/delete-room/:id`,
      verifyToken,
      verifyAdminOrSeller,
      async (req, res) => {
        const { reason } = req?.query;
        const id = req?.params?.id;
        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      }
    );

    app.get(
      `/manage-orders/:email`,
      verifyToken,
      verifySeller,
      async (req, res) => {
        const email = req?.params?.email;
        const result = await bookingCollection
          .find({ "seller.email": email })
          .toArray();
        res.send(result);
      }
    );

    app.patch(
      `/update-delivery-status/:id`,
      verifyToken,
      verifySeller,
      async (req, res) => {
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
      }
    );

    // admin dashboard
    // stats

    // admin-stats
    app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
      const { email } = req?.user;

      const bookings = await bookingCollection
        .find(
          {},
          {
            projection: {
              date: 1,
              totalPrice: 1,
            },
          }
        )
        .toArray();

      const { timeStamp } = await userCollection.findOne(
        { email },
        {
          projection: {
            timeStamp: 1,
          },
        }
      );

      const totalUsers = await userCollection.countDocuments({});

      const chartData = [["Month", "Month Sales", "Total Orders"]];

      const pipeline = [
        {
          $project: {
            date: { $toDate: "$date" },
            price: { $toDouble: "$totalPrice" },
            sold: { $toInt: "$sold_count" },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: { date: "$date", unit: "month", timezone: "UTC" },
            },
            totalSales: { $sum: "$price" },
            totalSold: { $sum: "$sold" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ];
      const rows = await bookingCollection.aggregate(pipeline).toArray();
      chartData.push(
        ...rows.map((r) => {
          const month = new Date(r._id).getUTCMonth() + 1;
          console.log(r._id);
          const year = new Date(r._id).getUTCFullYear();
          const fullDate = `${year}/${month}`;
          console.log(fullDate);
          return [fullDate, Number(r.totalSales), Number(r.totalOrders)];
        })
      );

      const totalSales = bookings.reduce(
        (acc, booking) => acc + Number(booking?.totalPrice),
        0
      );

      res.send({
        totalSold: bookings.length,
        timeStamp,
        totalUsers,
        totalSales,
        chartData,
      });
    });

    app.patch(
      "/update-user-role/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
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
      }
    );

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
