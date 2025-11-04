import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "#db/client";

dotenv.config();

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const {
      rows: [user],
    } = await db.query("SELECT id, username FROM users WHERE id = $1", [
      payload.id,
    ]);

    if (!user) return res.status(401).send("Unauthorized");

    req.user = user;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.status(401).send("Unauthorized");
  }
}
