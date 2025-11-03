import db from "#db/client";

// Get product by ID
export async function getProductById(id) {
  const {
    rows: [product],
  } = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return product;
}

// Get all products
export async function getAllProducts() {
  const { rows: products } = await db.query(`SELECT * FROM products`);
  return products;
}

// Get all orders for a specific product and user
export async function getOrdersForProductByUser(productId, userId) {
  const { rows: orders } = await db.query(
    `SELECT o.*
     FROM orders o
     JOIN orders_products op ON o.id = op.order_id
     WHERE op.product_id = $1 AND o.user_id = $2`,
    [productId, userId]
  );
  return orders;
}
