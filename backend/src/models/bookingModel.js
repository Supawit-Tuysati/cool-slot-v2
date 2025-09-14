import prisma from "../../prisma/client.js";

// ดึงข้อมูลตู้เย็นพร้อมชั้นและช่อง
export const findAllFridgesSlots = async () => {
   return prisma.fridge.findMany({
    include: {
      shelves: {
        include: {
          slots: {
            include: {
              bookings: {
                include: {
                  items: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const findBookings = async () => {
  return prisma.fridge.findMany({
    include: {
      shelves: {
        include: {
          slots: {
            include: {
              bookings: {
                include: {
                  items: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const createBooking = async (data) => {
  const { user_id, slot_id, start_time, end_time, note, items } = data;

  // Transaction เพื่อให้ทุกขั้นตอนสำเร็จพร้อมกัน
  return prisma.$transaction(async (tx) => {
    // 1. สร้าง Booking + Items
    const booking = await tx.booking.create({
      data: {
        user_id,
        slot_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            note: item.note,
          })),
        },
      },
      include: {
        items: true,
        slot: {
          include: {
            shelf: {
              include: {
                fridge: true,
              },
            },
          },
        },
      },
    });

    // 2. อัปเดตสถานะ slot เป็น booked
    await tx.fridgeSlot.update({
      where: { id: slot_id },
      data: { status: "booked" },
    });

    return booking;
  });
};
