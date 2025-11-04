import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "#db/client";
import requireBody from "#middleware/requireBody";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const SALT_ROUNDS = 10;

// 🔒 POST /users/register - Create a new user and return a token
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert user into DB
      const {
        rows: [user],
      } = await db.query(
        `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING id, username`,
        [username, hashedPassword]
      );

      // Sign a JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

      res.status(201).send(token);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// 🔒 POST /users/login - Authenticate user and return a token
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const {
        rows: [user],
      } = await db.query("SELECT * FROM users WHERE username = $1", [username]);

      if (!user) return res.status(401).send("Invalid credentials");

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).send("Invalid credentials");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.send(token);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

export default router;
