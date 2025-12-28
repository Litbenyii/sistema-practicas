const { prisma } = require("../config/prisma");
const bcrypt = require("bcryptjs");
const { Role } = require("@prisma/client");

async function createStudentByCoordination({ name, email, rut, career, password }) {
  if (!name || !email || !rut || !career) {
    throw new Error("Faltan datos obligatorios del estudiante.");
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error("Ya existe un usuario con ese correo.");
  }

  const existingRut = await prisma.user.findUnique({ where: { rut } });
  if (existingRut) {
    throw new Error("Ya existe un usuario con ese RUT.");
  }

  const plainPassword =
    password && password.trim().length >= 4 ? password.trim() : "123456";

  const hashed = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      rut,
      password: hashed,
      role: Role.STUDENT,
      enabled: true,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: user.id,
      career,
    },
  });

  return {
    id: student.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    rut: user.rut,
    career: student.career,
  };
}

module.exports = {
  createStudentByCoordination,
};
