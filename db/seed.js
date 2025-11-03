import db from "#db/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Connect To DataBase
  await db.connect();

  // --- Clear existing data ---
  await db.query(`DELETE FROM orders_products`);
  await db.query(`DELETE FROM orders`);
  await db.query(`DELETE FROM products`);
  await db.query(`DELETE FROM users`);

  // --- Create 1 fake user ---
  const username = faker.person.fullName().toLowerCase();
  const password = "password012";
  const hashed = await bcrypt.hash(password, 10);

  const {
    rows: [user],
  } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    [username, hashed]
  );

  console.log(`👤 Created user: ${user.username} (password: ${password})`);

  // --- Create 10 fake products ---
  const products = [];
  for (let i = 0; i < 10; i++) {
    const title = faker.commerce.productName();
    const description = faker.commerce.productDescription();

    // ✅ Correct Faker decimal price generation
    const price = faker.number.float({ min: 5, max: 100, precision: 0.01 });

    const {
      rows: [product],
    } = await db.query(
      `INSERT INTO products (title, description, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, price]
    );

    products.push(product);
  }

  console.log(`📦 Created ${products.length} products`);

  // --- Create 1 order for the user ---
  const {
    rows: [order],
  } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES (CURRENT_DATE, $1, $2)
     RETURNING *`,
    [faker.lorem.sentence(), user.id]
  );

  console.log(`🧾 Created order ID ${order.id} for user ${user.username}`);

  // --- Add 5 distinct products to the order ---
  const selectedProducts = faker.helpers.arrayElements(products, 5);

  for (const product of selectedProducts) {
    const quantity = faker.number.int({ min: 1, max: 5 });

    await db.query(
      `INSERT INTO orders_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [order.id, product.id, quantity]
    );
  }

  console.log(`🛒 Added 5 distinct products to order ${order.id}`);
  console.log("✅ Seeding complete!");

  // Close the database connection
  await db.end();
}

// Seed Error
seed().catch((err) => {
  console.error("❌ Seed error:", err);
  db.end();
});
