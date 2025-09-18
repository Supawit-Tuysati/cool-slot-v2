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
  const now = new Date(); // ✅ ต้องประกาศก่อนใช้

  return prisma.fridge.findMany({
    where: { id },
    include: {
      shelves: {
        include: {
          slots: {
            include: {
              bookings: {
                where: {
                  end_time: { gt: now }, // ✅ filter booking ตาม end_time
                },
                include: {
                  items: true, // item จะดึงทั้งหมด (ไม่มี end_time ที่นี่)
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

export const updateBooking = async (data) => {
  const { booking_id, user_id, slot_id, start_time, end_time, items } = data;

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: booking_id },
      data: {
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        slot: { connect: { id: slot_id } },
        user: { connect: { id: user_id } },
        items: {
          upsert: items.map((item) => ({
            where: { id: item.id || 0 },
            update: {
              name: item.name,
              quantity: item.quantity,
              note: item.note,
            },
            create: {
              name: item.name,
              quantity: item.quantity,
              note: item.note,
            },
          })),
        },
      },
      include: {
        items: true,
        slot: {
          include: {
            shelf: { include: { fridge: true } },
          },
        },
      },
    });

    // อัพเดตสถานะช่อง (ยังปิดไว้)
    await tx.fridgeSlot.update({
      where: { id: slot_id },
      data: { is_disabled: true },
    });

    return booking;
  });
};

export const cancelBooking = async (data) => {
  const { booking_id, slot_id, user_id } = data;

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: booking_id },
      data: {
        cancelled_at: new Date(),
        cancelled_by: user_id,
      },
    });

    // อัพเดตสถานะช่อง (ยังปิดไว้)
    await tx.fridgeSlot.update({
      where: { id: slot_id },
      data: { is_disabled: true },
    });

    return booking;
  });
};
