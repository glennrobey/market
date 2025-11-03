import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import getUserFromToken from "#middleware/getUserFromToken";

const router = express.Router();

// GET /products - All Products
router.get("/", async (req, res) => {
  try {
    const { rows: products } = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET /products/:id - Single Product
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const {
      rows: [product],
    } = await db.query(`SELECT * FROM products WHERE id = $1`, [productId]);

    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 🔒 GET /products/:id/orders - Orders of logged-in user containing this product
router.get("/:id/orders", getUserFromToken, requireUser, async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  try {
    const {
      rows: [product],
    } = await db.query("SELECT * FROM products WHERE id = $1", [productId]);
    if (!product) return res.status(404).send("Product not found");

    const { rows: orders } = await db.query(
      `
      SELECT o.*
      FROM orders o
      JOIN orders_products op ON o.id = op.order_id
      WHERE op.product_id = $1 AND o.user_id = $2
      `,
      [productId, userId]
    );

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
