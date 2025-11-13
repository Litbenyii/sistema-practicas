const service = require("../services/auth.service");

async function postLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Falta correo o contraseña" });

    const data = await service.login(email, password);
    return res.json(data);
  } catch (err) {
    console.error("Error en login:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Error interno en login" });
  }
}

async function createStudent(req, res) {
  try {
    const result = await service.createStudent(req.body);
    return res.status(201).json({
      message: "Estudiante creado correctamente",
      ...result,
    });
  } catch (err) {
    console.error("Error al crear estudiante:", err);
    return res.status(400).json({ error: err.message || "No se pudo crear el estudiante" });
  }
}

module.exports = { postLogin, createStudent };
