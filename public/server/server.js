require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);
app.use(express.json());
app.use(express.static("../"));

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 9900, name: "Copper" }],
  [2, { priceInCents: 14900, name: "Iron" }],
  [3, { priceInCents: 19900, name: "Gold" }],
  [4, { priceInCents: 24900, name: "Diamond" }],
  [5, { priceInCents: 29900, name: "Netherite" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
      cancel_url: `${process.env.CLIENT_URL}/Store`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000);
