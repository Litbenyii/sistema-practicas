const {
  listOpenPractices,
  listExternalPracticeRequests,
  approvePracticeRequest,
} = require("../services/practice.service");
const offerService = require("../services/offer.service");

async function getOpenPractices(req, res) {
  try {
    const practices = await listOpenPractices();
    res.json(practices);
  } catch (err) {
    console.error("Error al listar prácticas:", err);
    res.status(500).json({ error: "No se pudieron cargar las prácticas" });
  }
}

async function getPracticeRequests(req, res) {
  try {
    const requests = await listExternalPracticeRequests();
    res.json(requests);
  } catch (err) {
    console.error("Error al listar solicitudes de práctica externa:", err);
    res.status(500).json({
      error: "No se pudieron cargar las solicitudes de práctica externa",
    });
  }
}

async function postApprovePracticeRequest(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID de solicitud inválido" });
    }

    const practice = await approvePracticeRequest(id);

    return res.json({
      message: "Práctica externa aprobada correctamente",
      practice,
    });
  } catch (err) {
    console.error("Error al aprobar práctica externa:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "No se pudo aprobar la práctica externa" });
  }
}

async function postOffer(req, res) {
  try {
    const offer = await offerService.createOffer(req.body);
    return res.status(201).json(offer);
  } catch (err) {
    console.error("Error al crear oferta:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "No se pudo crear la oferta" });
  }
}

module.exports = {
  getOpenPractices,
  getPracticeRequests,
  postApprovePracticeRequest,
  postOffer,
};
