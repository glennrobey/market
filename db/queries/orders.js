import db from "#db/client";

// Get order by ID
export async function getOrderById(id) {
  const {
    rows: [order],
  } = await db.query(`SELECT * FROM orders WHERE id = $1`, [id]);
  return order;
}

// Get all orders for a user
export async function getOrdersByUserId(userId) {
  const { rows: orders } = await db.query(
    `SELECT * FROM orders WHERE user_id = $1`,
    [userId]
  );
  return orders;
}

// Create a new order
export async function createOrder(date, note, userId) {
  const {
    rows: [order],
  } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [date, note, userId]
  );
  return order;
}
