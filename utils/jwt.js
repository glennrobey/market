import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error(
    "JWT_SECRET is not defined in environment variables. Please set it in your .env file."
  );
}

/** Creates a token with the given payload */
export function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/** Extracts the payload from a token */
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
