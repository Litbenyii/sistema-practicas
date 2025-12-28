const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const config = require("../config/env");

const JWT_SECRET = config.jwtSecret || "dev_secret_change_me";

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload || !payload.id) {
      return res
        .status(401)
        .json({ message: "Token inválido: falta información de usuario." });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.enabled) {
      return res.status(401).json({ message: "Usuario no autorizado." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Error en verifyToken:", err);
    return res
      .status(401)
      .json({ message: "Token inválido o expirado." });
  }
}

function requireStudent(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "No autenticado (falta usuario en petición)." });
  }
  if (req.user.role !== "STUDENT") {
    return res
      .status(403)
      .json({ message: "Rol no autorizado (solo STUDENT)." });
  }
  next();
}

function requireCoordination(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "No autenticado (falta usuario en petición)." });
  }
  if (req.user.role !== "COORDINATION") {
    return res
      .status(403)
      .json({ message: "Rol no autorizado (solo COORDINATION)." });
  }
  next();
}

module.exports = {
  verifyToken,
  requireStudent,
  requireCoordination,
};
