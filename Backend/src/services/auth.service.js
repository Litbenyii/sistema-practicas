const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const config = require("../config/env");

async function login(email, password) {

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const err = new Error("Usuario no existe");
    err.status = 401;
    throw err;
  }

  if (!user.enabled) {
    const err = new Error("Usuario deshabilitado");
    err.status = 403;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Contraseña incorrecta");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};
