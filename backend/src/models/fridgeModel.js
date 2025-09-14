// fridgeModel.js
import prisma from "../../prisma/client.js";

export const findAllFridges = async () => {
  return await prisma.fridge.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      created_at: true,
      updated_at: true,
      _count: { select: { shelves: true } },
      shelves: {
        select: {
          id: true,
          shelf_number: true,
          shelf_name: true,
          _count: { select: { slots: true } },
          slots: {
            select: {
              id: true,
              slot_number: true,
              is_disabled: true,
              _count: { select: { bookings: true } },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
};

export const findFridgeShelves = async (fridgeId) => {
  return await prisma.fridge.findUnique({
    where: {
      id: fridgeId,
    },
    include: {
      shelves: {
        include: {
          slots: {
            orderBy: {
              slot_number: "asc",
            },
          },
        },
        orderBy: {
          shelf_number: "asc",
        },
      },
    },
  });
};

export const createFridgeShelves = async ({ name, location, description, created_by, shelves }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. สร้างตู้เย็น
    const fridge = await tx.fridge.create({
      data: {
        name,
        location,
        description,
        created_by,
      },
    });

    // 2. สร้างชั้นและช่อง
    for (const shelfData of shelves) {
      const shelf = await tx.fridgeShelf.create({
        data: {
          fridge_id: fridge.id,
          shelf_number: shelfData.shelf_number,
          shelf_name: shelfData.shelf_name,
          created_by,
        },
      });

      // 3. สร้างช่องในชั้นนี้
      const slotPromises = shelfData.slots.map((slotData) =>
        tx.fridgeSlot.create({
          data: {
            shelf_id: shelf.id,
            slot_number: slotData.slot_number,
            created_by,
          },
        })
      );

      await Promise.all(slotPromises);
    }

    // 4. ดึงข้อมูลกลับมาพร้อมชั้นและช่อง
    const fridgeWithShelves = await tx.fridge.findUnique({
      where: { id: fridge.id },
      include: {
        shelves: {
          include: {
            slots: {
              orderBy: {
                slot_number: "asc",
              },
            },
          },
          orderBy: {
            shelf_number: "asc",
          },
        },
      },
    });

    return fridgeWithShelves;
  });
};

// ฟังก์ชันสำหรับจัดการ slots ในแต่ละ shelf
const updateSlotsForShelf = async (tx, shelfId, incomingSlots, updated_by) => {
  // ดึงข้อมูล slots ปัจจุบัน
  const currentSlots = await tx.fridgeSlot.findMany({
    where: {
      shelf_id: shelfId,
    },
  });

  const existingSlotsMap = new Map(currentSlots.map((slot) => [slot.id, slot]));

  // แยกประเภท slots
  const slotsToUpdate = incomingSlots.filter(
    (slot) => slot.id && typeof slot.id === "number" && existingSlotsMap.has(slot.id)
  );

  const slotsToCreate = incomingSlots.filter(
    (slot) => !slot.id || typeof slot.id !== "number" || !existingSlotsMap.has(slot.id)
  );

  const incomingSlotIds = new Set(slotsToUpdate.map((slot) => slot.id));

  // อัปเดต slots ที่มีอยู่
  for (const slotData of slotsToUpdate) {
    await tx.fridgeSlot.update({
      where: { id: slotData.id },
      data: {
        slot_number: slotData.slot_number,
        updated_by,
      },
    });
  }

  // สร้าง slots ใหม่
  for (const slotData of slotsToCreate) {
    await tx.fridgeSlot.create({
      data: {
        shelf_id: shelfId,
        slot_number: slotData.slot_number,
        status: "available",
        created_by: updated_by,
      },
    });
  }

  // Soft delete slots ที่ไม่มีใน request
  const slotsToDelete = currentSlots.filter((slot) => !incomingSlotIds.has(slot.id));
  for (const slot of slotsToDelete) {
    await tx.fridgeSlot.update({
      where: { id: slot.id },
    });
  }
};

export const updateFridgeShelves = async ({ id, name, location, description, updated_by, shelves }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. อัพเดทข้อมูลพื้นฐานของตู้เย็น
    const fridge = await tx.fridge.update({
      where: { id },
      data: {
        name,
        location,
        description,
        updated_by,
      },
    });

    if (shelves && Array.isArray(shelves)) {
      // 2. ดึงข้อมูลชั้นและช่องปัจจุบัน
      const currentShelves = await tx.fridgeShelf.findMany({
        where: {
          fridge_id: id,
        },
        include: {
          slots: true,
        },
      });

      // 3. แยกประเภทการดำเนินการสำหรับชั้น
      const existingShelvesMap = new Map(currentShelves.map((shelf) => [shelf.id, shelf]));

      // แยกแยะ shelf ที่มีอยู่กับ shelf ใหม่อย่างชัดเจน
      const shelvesToUpdate = shelves.filter(
        (shelf) => shelf.id && typeof shelf.id === "number" && existingShelvesMap.has(shelf.id) // ต้องมีในฐานข้อมูลจริง
      );

      const shelvesToCreate = shelves.filter(
        (shelf) => !shelf.id || typeof shelf.id !== "number" || !existingShelvesMap.has(shelf.id) // ไม่มีในฐานข้อมูล
      );

      const incomingShelfIds = new Set(shelvesToUpdate.map((shelf) => shelf.id));

      // console.log(`Shelves to update: ${shelvesToUpdate.length}`);
      // console.log(`Shelves to create: ${shelvesToCreate.length}`);

      // 4. อัพเดทชั้นที่มีอยู่
      for (const shelfData of shelvesToUpdate) {
        console.log(`Updating shelf ID: ${shelfData.id}`);

        await tx.fridgeShelf.update({
          where: { id: shelfData.id },
          data: {
            shelf_number: shelfData.shelf_number,
            shelf_name: shelfData.shelf_name,
            updated_by,
          },
        });

        // จัดการช่องในชั้นนี้
        await updateSlotsForShelf(tx, shelfData.id, shelfData.slots || [], updated_by);
      }

      // 5. สร้างชั้นใหม่
      for (const shelfData of shelvesToCreate) {
        console.log(`Creating new shelf: ${shelfData.shelf_name}`);

        const newShelf = await tx.fridgeShelf.create({
          data: {
            fridge_id: id,
            shelf_number: shelfData.shelf_number,
            shelf_name: shelfData.shelf_name,
            created_by: updated_by,
          },
        });

        // สร้างช่องใหม่สำหรับชั้นใหม่
        if (shelfData.slots && shelfData.slots.length > 0) {
          const slotPromises = shelfData.slots.map((slotData) =>
            tx.fridgeSlot.create({
              data: {
                shelf_id: newShelf.id,
                slot_number: slotData.slot_number,
                status: "available",
                created_by: updated_by,
              },
            })
          );
          await Promise.all(slotPromises);
        }
      }

      // 6. Soft delete ชั้นที่ไม่มีใน request
      const shelvesToDelete = currentShelves.filter((shelf) => !incomingShelfIds.has(shelf.id));

      console.log(`Shelves to delete: ${shelvesToDelete.length}`);

      for (const shelf of shelvesToDelete) {
        console.log(`Soft deleting shelf ID: ${shelf.id}`);

        // ลบช่องทั้งหมดในชั้นนี้ก่อน
        await tx.fridgeSlot.updateMany({
          where: { shelf_id: shelf.id },
        });

        // แล้วลบชั้น
        await tx.fridgeShelf.update({
          where: { id: shelf.id },
        });
      }
    }

    // 7. ดึงข้อมูลกลับมาพร้อมชั้นและช่อง
    const fridgeWithShelves = await tx.fridge.findUnique({
      where: { id },
      include: {
        shelves: {
          include: {
            slots: {
              orderBy: { slot_number: "asc" },
            },
          },
          orderBy: { shelf_number: "asc" },
        },
      },
    });

    return fridgeWithShelves;
  });
};

export const deleteFridge = async (id) => {
  return await prisma.fridge.delete({
    where: { id },
  });
};
