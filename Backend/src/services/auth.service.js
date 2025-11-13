const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { Role } = require("@prisma/client");
const { config } = require("../config/env");

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuario no existe");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Contraseña incorrecta");

  if (user.role === "STUDENT" && !user.enabled) {
    const err = new Error("Estudiante no habilitado para registrar práctica");
    err.status = 403;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    config.jwtSecret
  );

  return { token, role: user.role, name: user.name };
}

async function createStudent({ email, password, rut, name, career }) {
  if (!email || !password || !rut || !name || !career) {
    throw new Error("Faltan datos del estudiante");
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) throw new Error("Ya existe un usuario con ese correo");

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      rut,
      name,
      password: hash,
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

  return { userId: user.id, studentId: student.id };
}

module.exports = { login, createStudent };
