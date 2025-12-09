const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (usuario no encontrado)" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (contraseña incorrecta)" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role, 
      },
      process.env.JWT_SECRET || "dev_secret_change_me",
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
