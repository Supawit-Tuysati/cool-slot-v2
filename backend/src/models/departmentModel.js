import prisma from "../../prisma/client.js";


export const findAllDepartments = async () => {
  return await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const createDept = async (data) => {
  return await prisma.department.create({ data });
};

export const updateDept = async ({ id, name, description, updated_by }) => {
  return await prisma.department.update({
    where: { id },
    data: {
      name,
      description,
      updated_by,
      updated_at: new Date(),
    },
  });
};

export const deleteDept = async (id) => {
  return await prisma.department.delete({
    where: { id },
  });
};


