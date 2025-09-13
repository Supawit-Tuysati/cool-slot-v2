import prisma from "../../prisma/client.js";

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      line_user_id: true,
      role: {
        select: { id: true, name: true },
      },
      department: {
        select: { id: true, name: true },
      },
    },
  });
};

export const findAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: [{ status: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      lastLogin: true,
      status: true,
      role: {
        select: { name: true },
      },
      department: {
        select: { name: true },
      },
      created_at: true,
    },
  });
};

export const createUser = async (data) => {
  return await prisma.user.create({ data });
};

export const updateLastLogin = (email) => {
  return prisma.user.update({
    where: { email },
    data: { lastLogin: new Date() },
  });
};

export const editUser = async ({ id, name, email, role_id, department_id, line_user_id, updated_by }) => {
  return await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role_id,
      department_id,
      line_user_id,
      updated_by,
      updated_at: new Date(),
    },
  });
};

export const delUser = async ({ id }) => {
  return await prisma.user.update({
    where: { id },
  });
};
