const { listOpenPractices } = require("../services/practice.service");

async function getOpenPractices(req, res) {
  try {
    const practices = await listOpenPractices();
    res.json(practices);
  } catch (err) {
    console.error("Error al listar prácticas:", err);
    res.status(500).json({ error: "No se pudieron cargar las prácticas" });
  }
}

module.exports = { getOpenPractices };
