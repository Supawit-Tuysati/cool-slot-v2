import { findAllDepartments, createDept, updateDept, deleteDept } from "../models/departmentModel.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await findAllDepartments();

    res.json(departments);
  } catch (error) {
    console.error("getProfileAll error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user.id;

    const departments = await createDept({ name, description, created_by });

    res.json(departments);
  } catch (error) {
    console.error("getProfileAll error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    const updated_by = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Missing department ID" });
    }

    const updatedDepartment = await updateDept({
      id,
      name,
      description,
      updated_by,
    });

    res.json(updatedDepartment);
  } catch (error) {
    console.error("updateDepartment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ message: "Missing department ID" });
    }

    await deleteDept(id);

    res.json({ message: `Department with id ${id} deleted successfully.` });
  } catch (error) {
    console.error("deleteDepartment error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "ไม่สามารถลบข้อมูลได้เนื่องจากข้อมูลถูกใช้งานอยู่",
      });
    }

    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ" });
  }
};
