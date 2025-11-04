import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";
import { authenticateToken } from "#middleware/auth";

/**
 * Middleware to attach a user to req if a valid token is provided.
 * Skips authentication if no token is present.
 */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  // No token provided, skip attaching user
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];

  try {
    // Verify token and extract payload
    const payload = verifyToken(token);

    // Ensure the token contains an ID
    if (!payload?.id) return res.status(401).send("Invalid token payload.");

    // Fetch user from DB
    const user = await getUserById(payload.id);

    if (!user) return res.status(404).send("User not found.");

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    // Do not expose sensitive info, just log the message
    console.error("Token verification error:", err.message);
    res.status(401).send("Invalid or expired token.");
  }
}
