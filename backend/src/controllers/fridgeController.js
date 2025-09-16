// fridgeController.js
import {
  findAllFridges,
  createFridgeShelves,
  updateFridgeShelves,
  findFridgeShelves,
  deleteFridge,
  checkBookingsSlot
} from "../models/fridgeModel.js";

export const getFridges = async (req, res) => {
  try {
    const fridges = await checkBookingsSlot();
    res.json(fridges);
  } catch (error) {
    console.error("getFridges error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFridgeController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ message: "Missing fridge ID" });
    }

    const fridge = await findFridgeShelves(id);

    if (!fridge) {
      return res.status(404).json({ message: "ไม่พบข้อมูลตู้เย็น" });
    }

    res.json(fridge);
  } catch (error) {
    console.error("getFridge error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFridgeController = async (req, res) => {
  try {
    const { name, location, description, shelves } = req.body;
    const created_by = req.user.id;

    // Validation
    if (!name || !location) {
      return res.status(400).json({ message: "กรุณากรอก name และ location ให้ครบ" });
    }

    // ตรวจสอบข้อมูล shelves
    if (!shelves || !Array.isArray(shelves) || shelves.length === 0) {
      return res.status(400).json({ message: "กรุณาเพิ่มชั้นอย่างน้อย 1 ชั้น" });
    }

    // ตรวจสอบข้อมูลในแต่ละชั้น
    for (const shelf of shelves) {
      if (!shelf.shelf_name || !shelf.shelf_name.trim()) {
        return res.status(400).json({ message: "กรุณากรอกชื่อชั้นให้ครบ" });
      }
      if (!shelf.slots || !Array.isArray(shelf.slots) || shelf.slots.length === 0) {
        return res.status(400).json({ message: "แต่ละชั้นต้องมีช่องอย่างน้อย 1 ช่อง" });
      }
    }

    console.log("shelves to create:", shelves);

    const fridge = await createFridgeShelves({
      name,
      location,
      description,
      created_by,
      shelves,
    });

    res.status(201).json(fridge);
  } catch (error) {
    console.error("createFridge error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateFridgeController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, location, description, shelves } = req.body;
    const updated_by = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Missing fridge ID" });
    }

    // Validation
    if (!name || !location) {
      return res.status(400).json({ message: "กรุณากรอก name และ location ให้ครบ" });
    }

    // ตรวจสอบข้อมูล shelves ถ้ามีการส่งมา
    if (shelves) {
      if (!Array.isArray(shelves) || shelves.length === 0) {
        return res.status(400).json({ message: "กรุณาเพิ่มชั้นอย่างน้อย 1 ชั้น" });
      }

      // ตรวจสอบข้อมูลในแต่ละชั้น
      for (const shelf of shelves) {
        if (!shelf.shelf_name || !shelf.shelf_name.trim()) {
          return res.status(400).json({ message: "กรุณากรอกชื่อชั้นให้ครบ" });
        }
        if (!shelf.slots || !Array.isArray(shelf.slots) || shelf.slots.length === 0) {
          return res.status(400).json({ message: "แต่ละชั้นต้องมีช่องอย่างน้อย 1 ช่อง" });
        }
      }
    }

    const updatedFridge = await updateFridgeShelves({
      id,
      name,
      location,
      description,
      updated_by,
      shelves,
    });

    res.json(updatedFridge);
  } catch (error) {
    console.error("updateFridge error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFridgeController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ message: "Missing fridge ID" });
    }

    await deleteFridge(id);

    res.json({ message: `Fridge with id ${id} deleted successfully.` });
  } catch (error) {
    console.error("deleteFridge error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "ไม่สามารถลบข้อมูลได้เนื่องจากข้อมูลถูกใช้งานอยู่",
      });
    }

    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ" });
  }
};
