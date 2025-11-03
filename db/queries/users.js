import db from "#db/client";

// Get user by ID
export async function getUserById(id) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return user;
}

// Get user by username
export async function getUserByUsername(username) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  return user;
}

// Create a new user
export async function createUser(username, hashedPassword) {
  const {
    rows: [user],
  } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    [username, hashedPassword]
  );
  return user;
}
