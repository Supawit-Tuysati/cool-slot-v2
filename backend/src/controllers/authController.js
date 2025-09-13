import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, updateLastLogin } from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  const { name, email, password, role_id, department_id, employee_code, line_user_id, created_by } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role_id,
      department_id,
      employee_code,
      line_user_id,
      created_by,
    });

    res.status(201).json({ message: "User created", user_id: newUser.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "บัญชีผู้ใช้นี้ถูกปิดใช้งาน กรุณาติดต่อฝ่ายทรัพยากรบุคคล (HR)",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const updatedLastLogin = await updateLastLogin(email);
    if (!updatedLastLogin) return res.status(500).json({ message: "ไม่สามารถอัปเดตเวลาล็อกอินล่าสุดได้" });

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
