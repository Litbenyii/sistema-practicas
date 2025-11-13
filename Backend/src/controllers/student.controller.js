const offerSvc = require("../services/offer.service");
const appSvc = require("../services/application.service");
const pracSvc = require("../services/practice.service");

async function getOffers(req, res) {
  try {
    const offers = await offerSvc.listActiveOffers();
    res.json(offers);
  } catch (err) {
    console.error("Error al listar ofertas:", err);
    res.status(500).json({ error: "No se pudieron cargar las ofertas" });
  }
}

async function postApplication(req, res) {
  try {
    const { offerId } = req.body;
    const application = await appSvc.createApplication(req.user.id, offerId);
    res.status(201).json(application);
  } catch (err) {
    console.error("Error al postular:", err);
    res.status(400).json({ error: err.message || "No se pudo registrar la postulación" });
  }
}

async function postExternalPractice(req, res) {
  try {
    const created = await pracSvc.createExternalPractice(req.user.id, req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error al registrar práctica externa:", err);
    res.status(400).json({ error: err.message || "No se pudo registrar la práctica externa" });
  }
}

async function getMyRequests(req, res) {
  try {
    const data = await appSvc.myRequests(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener solicitudes:", err);
    res.status(500).json({ error: "No se pudieron cargar las solicitudes" });
  }
}

module.exports = { getOffers, postApplication, postExternalPractice, getMyRequests };
