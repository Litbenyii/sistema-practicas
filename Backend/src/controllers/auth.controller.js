const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const config = require("../config/env");

const JWT_SECRET = config.jwtSecret || "dev_secret_change_me";

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (usuario no encontrado)" });
    }

    const passwordOK = await bcrypt.compare(password, user.password);
    if (!passwordOK) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (contraseña incorrecta)" });
    }

    if (!user.enabled) {
      return res
        .status(401)
        .json({ message: "Usuario deshabilitado, contacte a coordinación" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

module.exports = {
  login,
};
