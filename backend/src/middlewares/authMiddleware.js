import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../../prisma/client.js";

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Unauthorized: Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user || user.deleted_at) {
      return res.status(403).json({ message: "User not found or deactivated" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      department: user.department.name,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
