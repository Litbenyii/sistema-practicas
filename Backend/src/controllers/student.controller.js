const prisma = require("../config/prisma");
const {
  myRequests,
  createApplication,
} = require("../services/application.service");

async function getStudentByUserId(userId) {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new Error("No se encontró el estudiante asociado a este usuario");
  }

  return student;
}

async function getOffers(req, res) {
  try {
    const offers = await prisma.offer.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(offers);
  } catch (error) {
    console.error("Error en getOffers:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener las ofertas de práctica" });
  }
}

async function getApplications(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { Offer: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(applications);
  } catch (error) {
    console.error("Error en getApplications:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener tus postulaciones" });
  }
}

async function applyToOffer(req, res) {
  try {
    const offerId = req.params.offerId;

    const application = await createApplication(req.user.id, offerId);

    return res.status(201).json(application);
  } catch (error) {
    console.error("Error en applyToOffer:", error);
    return res
      .status(400)
      .json({
        message: error.message || "Error al postular a la oferta",
      });
  }
}

async function getPracticeRequests(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);

    const requests = await prisma.practiceRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(requests);
  } catch (error) {
    console.error("Error en getPracticeRequests:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener tus prácticas externas" });
  }
}

async function createPracticeRequest(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);

    const {
      company,
      tutorName,
      tutorEmail,
      supervisorName,
      supervisorEmail,
      startDate,
      endDate,
      objectives,
      details,
    } = req.body;

    const finalTutorName = tutorName || supervisorName;
    const finalTutorEmail = tutorEmail || supervisorEmail;
    const finalDetails = details || objectives || null;

    if (
      !company ||
      !finalTutorName ||
      !finalTutorEmail ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios de la práctica externa",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Fechas de inicio o término inválidas",
      });
    }

    const request = await prisma.practiceRequest.create({
      data: {
        studentId: student.id,
        company,
        tutorName: finalTutorName,
        tutorEmail: finalTutorEmail,
        startDate: start,
        endDate: end,
        details: finalDetails,
      },
    });

    return res.status(201).json(request);
  } catch (error) {
    console.error("Error en createPracticeRequest:", error);
    return res.status(500).json({
      message: "Error al registrar la práctica externa",
    });
  }
}

async function getMyRequests(req, res) {
  try {
    const data = await myRequests(req.user.id);
    return res.json(data);
  } catch (error) {
    console.error("Error en getMyRequests:", error);
    return res.status(500).json({
      message: "Error al obtener tus solicitudes",
    });
  }
}

module.exports = {
  getOffers,
  getApplications,
  applyToOffer,
  getPracticeRequests,
  createPracticeRequest,
  getMyRequests,
};
