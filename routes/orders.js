import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import getUserFromToken from "#middleware/getUserFromToken";
import requireBody from "#middleware/requireBody";

const router = express.Router();

// 🔒 POST /orders - Create a new order
router.post(
  "/",
  getUserFromToken,
  requireUser,
  requireBody(["date"]),
  async (req, res) => {
    const { date, note } = req.body;
    const userId = req.user.id;

    try {
      const {
        rows: [order],
      } = await db.query(
        `INSERT INTO orders (date, note, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [date, note || null, userId]
      );

      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// 🔒 GET /orders - Get all orders for logged-in user
router.get("/", getUserFromToken, requireUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows: orders } = await db.query(
      `SELECT * FROM orders WHERE user_id = $1`,
      [userId]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 🔒 GET /orders/:id - Get a specific order for logged-in user
router.get("/:id", getUserFromToken, requireUser, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const {
      rows: [order],
    } = await db.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);

    if (!order) return res.status(404).send("Order not found");
    if (order.user_id !== userId) return res.status(403).send("Forbidden");

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 🔒 GET /orders/:id/products - Get products in an order
router.get("/:id/products", getUserFromToken, requireUser, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const {
      rows: [order],
    } = await db.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);

    if (!order) return res.status(404).send("Order not found");
    if (order.user_id !== userId) return res.status(403).send("Forbidden");

    const { rows: products } = await db.query(
      `
      SELECT p.*, op.quantity
      FROM products p
      JOIN orders_products op ON p.id = op.product_id
      WHERE op.order_id = $1
      `,
      [orderId]
    );

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
