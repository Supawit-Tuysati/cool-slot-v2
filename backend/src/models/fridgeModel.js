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

export const updateFridgeShelves = async ({ id, name, location, description, updated_by, shelves }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. อัปเดตข้อมูลตู้เย็น
    await tx.fridge.update({
      where: { id },
      data: { name, 
        location, description, updated_by, updated_at: new Date() },
    });

    if (Array.isArray(shelves)) {
      // 2. ดึงข้อมูลชั้นและช่องปัจจุบัน
      const currentShelves = await tx.fridgeShelf.findMany({
        where: { fridge_id: id },
        include: { slots: true },
      });

      // 3. แยกชั้นที่ต้องอัปเดตและสร้างใหม่
      const currentShelfIds = currentShelves.map((shelf) => shelf.id);
      const requestShelfIds = shelves.filter((shelf) => shelf.id).map((shelf) => shelf.id);

      // 4. อัปเดตชั้นที่มีอยู่
      for (const shelf of shelves) {
        if (shelf.id && currentShelfIds.includes(shelf.id)) {
          // อัปเดตข้อมูลชั้น
          await tx.fridgeShelf.update({
            where: { id: shelf.id },
            data: {
              shelf_number: shelf.shelf_number,
              shelf_name: shelf.shelf_name,
              updated_by,
              updated_at: new Date(),
            },
          });
          // อัปเดตช่องในชั้นนี้
          await updateSlotsForShelf(tx, shelf.id, shelf.slots || [], updated_by);
        }
      }

      // 5. สร้างชั้นใหม่
      for (const shelf of shelves) {
        if (!shelf.id || !currentShelfIds.includes(shelf.id)) {
          const newShelf = await tx.fridgeShelf.create({
            data: {
              fridge_id: id,
              shelf_number: shelf.shelf_number,
              shelf_name: shelf.shelf_name,
              created_by: updated_by,
            },
          });
          // สร้างช่องใหม่ในชั้นนี้
          if (Array.isArray(shelf.slots)) {
            for (const slot of shelf.slots) {
              await tx.fridgeSlot.create({
                data: {
                  shelf_id: newShelf.id,
                  slot_number: slot.slot_number,
                  created_by: updated_by,
                },
              });
            }
          }
        }
      }

      // 6. ลบชั้นที่ไม่มีใน request (ถ้าช่องทุกตัว is_disabled == 0)
      for (const shelf of currentShelves) {
        if (!requestShelfIds.includes(shelf.id)) {
          // ดึงช่องทั้งหมดในชั้นนี้
          const slots = await tx.fridgeSlot.findMany({ where: { shelf_id: shelf.id } });
          // เช็คว่าช่องทุกตัว is_disabled == 0
          const canDeleteShelf = slots.every((slot) => slot.is_disabled === false);
          if (canDeleteShelf) {
            // ลบช่องทั้งหมด
            await tx.fridgeSlot.deleteMany({ where: { shelf_id: shelf.id } });
            // ลบชั้นนี้
            await tx.fridgeShelf.delete({ where: { id: shelf.id } });
          }
        }
      }
    }

    // 7. ดึงข้อมูลกลับ
    return await tx.fridge.findUnique({
      where: { id },
      include: {
        shelves: {
          include: { slots: { orderBy: { slot_number: "asc" } } },
          orderBy: { shelf_number: "asc" },
        },
      },
    });
  });
};

// ฟังก์ชันอัปเดตช่องในแต่ละชั้น
const updateSlotsForShelf = async (tx, shelfId, slots, updated_by) => {
  // 1. ดึงข้อมูลช่องปัจจุบัน
  const currentSlots = await tx.fridgeSlot.findMany({ where: { shelf_id: shelfId } });
  const currentSlotIds = currentSlots.map((slot) => slot.id);
  const requestSlotIds = slots.filter((slot) => slot.id).map((slot) => slot.id);

  // 2. อัปเดตช่องที่มีอยู่
  for (const slot of slots) {
    if (slot.id && currentSlotIds.includes(slot.id)) {
      await tx.fridgeSlot.update({
        where: { id: slot.id },
        data: {
          slot_number: slot.slot_number,
          updated_by,
          updated_at: new Date(),
        },
      });
    }
  }

  // 3. สร้างช่องใหม่
  for (const slot of slots) {
    if (!slot.id || !currentSlotIds.includes(slot.id)) {
      await tx.fridgeSlot.create({
        data: {
          shelf_id: shelfId,
          slot_number: slot.slot_number,
          created_by: updated_by,
        },
      });
    }
  }

  // 4. ลบช่องที่ไม่มีใน request (ถ้า is_disabled == 0)
  for (const slot of currentSlots) {
    if (!requestSlotIds.includes(slot.id) && slot.is_disabled === false) {
      await tx.fridgeSlot.delete({ where: { id: slot.id } });
    }
  }
};

export const deleteFridge = async (id) => {
  return await prisma.fridge.delete({
    where: { id },
  });
};

export const checkBookingsSlot = async () => {
  const allFridges = await findAllFridges();

  // เก็บ id ของช่องที่จะเปิดกลับ
  const slotsToUpdate = [];

  for (const fridge of allFridges) {
    for (const shelf of fridge.shelves) {
      for (const slot of shelf.slots) {
        // ดึง bookings ของช่องนี้
        const slotBookings = await prisma.booking.findMany({
          where: { slot_id: slot.id },
          select: { id: true, cleared_at: true, cancelled_at: true },
        });

        // คัดเอาเฉพาะ bookings ที่ยัง active
        const activeBookings = slotBookings.filter(
          (booking) => booking.cleared_at === null && booking.cancelled_at === null
        );

        // ถ้าไม่มี booking ที่ active และช่องยังถูกปิด → เก็บ id
        if (activeBookings.length === 0) {
          slotsToUpdate.push(slot.id);
          slot.is_disabled = false; // sync object ที่ return ออกไป
        }
      }
    }
  }

  // อัพเดตทีเดียว
  if (slotsToUpdate.length > 0) {
    await prisma.fridgeSlot.updateMany({
      where: { id: { in: slotsToUpdate } },
      data: { is_disabled: false },
    });
  }

  return allFridges;
};
