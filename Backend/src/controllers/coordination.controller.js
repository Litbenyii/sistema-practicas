const {
  createOfferService,
  listOffersService,
} = require("../services/offer.service");

const {
  listExternalPracticeRequests,
  approvePracticeRequest,
} = require("../services/practice.service");

async function createOfferController(req, res) {
  try {
    const { title, company, location, hours, modality, details } = req.body;

    if (!title || !company || !location || !details) {
      return res.status(400).json({
        message:
          "Faltan campos obligatorios (título, empresa, ubicación, detalles).",
      });
    }

    const offer = await createOfferService({
      title,
      company,
      location,
      hours,
      modality,
      details,
    });

    return res.status(201).json(offer);
  } catch (err) {
    console.error("Error creando oferta desde Coordinación:", err);
    return res.status(500).json({
      message: "Error interno del servidor al crear la oferta.",
    });
  }
}

async function listOffersController(req, res) {
  try {
    const offers = await listOffersService();
    return res.json(offers);
  } catch (err) {
    console.error("Error listando ofertas:", err);
    return res.status(500).json({
      message: "Error interno del servidor al listar ofertas.",
    });
  }
}

async function listExternalRequestsController(req, res) {
  try {
    const requests = await listExternalPracticeRequests();
    return res.json(requests);
  } catch (err) {
    console.error("Error listando solicitudes externas:", err);
    return res.status(500).json({
      message:
        "Error interno del servidor al listar solicitudes externas.",
    });
  }
}

async function approveExternalRequestController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de solicitud inválido." });
    }

    const result = await approvePracticeRequest(id);
    return res.json(result);
  } catch (err) {
    console.error("Error aprobando práctica externa:", err);
    return res.status(500).json({
      message: "Error interno del servidor al aprobar la práctica.",
    });
  }
}

module.exports = {
  createOfferController,
  listOffersController,
  listExternalRequestsController,
  approveExternalRequestController,
};
