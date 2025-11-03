import express from "express";
import db from "#db/client";
import bcrypt from "bcrypt";
import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";

const router = express.Router();

// POST /users/register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const hashed = await bcrypt.hash(password, 10);

      const {
        rows: [user],
      } = await db.query(
        `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
        [username, hashed]
      );

      // Create JWT Token
      const token = createToken({ id: user.id });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(400).send("Username may already exist.");
    }
  }
);

// POST /users/login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const {
        rows: [user],
      } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);

      if (!user) return res.status(400).send("Invalid credentials");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).send("Invalid credentials");

      const token = createToken({ id: user.id });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

export default router;
