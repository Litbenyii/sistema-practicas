const {
  createOfferService,
  listOffersService,
  deactivateOfferService,
} = require("../services/offer.service");

const {
  listExternalPracticeRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
} = require("../services/practice.service");

const {
  listApplicationsForCoordination,
  approveApplication,
  rejectApplication,
} = require("../services/application.service");

const { createStudentByCoordination } = require("../services/student.service");

// --- GESTIÓN DE OFERTAS ---

async function createOfferController(req, res) {
  try {
    const {
      title,
      company,
      location,
      hours,
      modality,
      details,
      deadline,
      startDate,
    } = req.body;

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
      deadline,
      startDate,
    });

    return res.status(201).json(offer);
  } catch (err) {
    console.error("Error creando oferta:", err);
    return res
      .status(500)
      .json({ message: "Error interno al crear la oferta." });
  }
}

async function listOffersController(req, res) {
  try {
    const offers = await listOffersService();
    return res.json(offers);
  } catch (err) {
    console.error("Error listando ofertas:", err);
    return res.status(500).json({ message: "Error al listar ofertas." });
  }
}

async function deactivateOfferController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deactivateOfferService(id);
    return res.json(result);
  } catch (err) {
    console.error("Error desactivando oferta:", err);
    const status = err.status || 500;
    return res
      .status(status)
      .json({ message: err.message || "Error al desactivar la oferta." });
  }
}

// --- GESTIÓN DE ESTUDIANTES ---

async function createStudentController(req, res) {
  try {
    const { name, email, rut, career, password } = req.body;
    const student = await createStudentByCoordination({
      name,
      email,
      rut,
      career,
      password,
    });
    return res.status(201).json(student);
  } catch (err) {
    console.error("Error creando estudiante:", err);
    return res
      .status(400)
      .json({ message: err.message || "Error al crear el estudiante." });
  }
}

// --- PRÁCTICAS EXTERNAS ---

async function listExternalRequestsController(req, res) {
  try {
    const requests = await listExternalPracticeRequests();
    return res.json(requests);
  } catch (err) {
    console.error("Error listando solicitudes externas:", err);
    return res
      .status(500)
      .json({ message: "Error al listar solicitudes externas." });
  }
}

async function approveExternalRequestController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const result = await approvePracticeRequest(id);
    return res.json(result);
  } catch (err) {
    console.error("Error aprobando práctica externa:", err);
    return res
      .status(500)
      .json({ message: "Error al aprobar la práctica externa." });
  }
}

async function rejectExternalRequestController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const result = await rejectPracticeRequest(id);
    return res.json(result);
  } catch (err) {
    console.error("Error rechazando práctica externa:", err);
    return res
      .status(500)
      .json({ message: "Error al rechazar la práctica externa." });
  }
}

// --- POSTULACIONES INTERNAS ---

async function listApplicationsController(req, res) {
  try {
    const applications = await listApplicationsForCoordination();
    return res.json(applications);
  } catch (err) {
    console.error("Error listando postulaciones:", err);
    return res
      .status(500)
      .json({ message: "Error al listar postulaciones." });
  }
}

async function approveApplicationController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const result = await approveApplication(id);
    return res.json(result);
  } catch (err) {
    console.error("Error aprobando postulación:", err);
    return res
      .status(500)
      .json({ message: "Error al aprobar la postulación." });
  }
}

async function rejectApplicationController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const result = await rejectApplication(id);
    return res.json(result);
  } catch (err) {
    console.error("Error rechazando postulación:", err);
    return res
      .status(500)
      .json({ message: "Error al rechazar la postulación." });
  }
}

module.exports = {
  createOfferController,
  listOffersController,
  deactivateOfferController,
  createStudentController,
  listExternalRequestsController,
  approveExternalRequestController,
  rejectExternalRequestController,
  listApplicationsController,
  approveApplicationController,
  rejectApplicationController,
};
