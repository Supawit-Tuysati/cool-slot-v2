import { findUserById, findAllUsers, editUser, delUser } from "../models/userModel.js";

export const getUser = async (req, res) => {
  try {
    const user = await findUserById(Number(req.user.id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserData = async (req, res) => {
  
  try {
    const user = await findUserById(Number(req.params.id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await findAllUsers();
    console.log(users );
    
    res.json(users);
  } catch (error) {
    console.error("getProfileAll error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, role_id, department_id,line_user_id } = req.body;
    const updated_by = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Missing User ID" });
    }

    const updatedUser = await editUser({
      id,
      name,
      email,
      role_id,
      department_id,
      line_user_id,
      updated_by,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ message: "Missing department ID" });
    }

    const deletedDepartment = await delUser({id});

    res.json(deletedDepartment);
  } catch (error) {
    console.error("updateDepartment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
