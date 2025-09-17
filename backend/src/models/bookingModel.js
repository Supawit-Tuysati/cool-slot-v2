import prisma from "../../prisma/client.js";

// ดึงข้อมูลตู้เย็นพร้อมชั้นและช่อง
export const findAllFridgesSlots = async (id) => {
  return prisma.fridge.findMany({
    where: { id },
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



export const findBooking = async (id) => {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const createBooking = async (data) => {
  const { user_id, slot_id, start_time, end_time, note, items } = data;

  return prisma.$transaction(async (tx) => {
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

    // เปลี่ยนจาก status: "booked" เป็น is_disabled: true
    await tx.fridgeSlot.update({
      where: { id: slot_id },
      data: { is_disabled: true },
    });

    return booking;
  });
};
