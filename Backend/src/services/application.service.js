const { prisma } = require("../config/prisma");
const { Status } = require("@prisma/client");

// Buscar el registro Student asociado a un User
async function getStudentFromUser(userId) {
  return prisma.student.findFirst({ where: { userId } });
}

// Crear una nueva postulacion a oferta interna
async function createApplication(userId, offerId) {
  const parsedOfferId = Number(offerId);

  if (!parsedOfferId) {
    throw new Error("Falta ID de oferta");
  }

  const student = await getStudentFromUser(userId);
  if (!student) {
    throw new Error("Estudiante no registrado en el sistema");
  }

  const offer = await prisma.offer.findUnique({
    where: { id: parsedOfferId },
  });

  if (!offer || !offer.active) {
    throw new Error("Oferta no válida");
  }
    //fecha limite de postulacion
  const now = new Date();
  if (offer.deadline && offer.deadline < now) {
    throw new Error("La oferta ya cerró su periodo de postulación.");
  }

  const dup = await prisma.application.findFirst({
    where: {
      studentId: student.id,
      offerId: offer.id,
    },
  });

  if (dup) {
    throw new Error("Ya postulaste a esta oferta");
  }

  return prisma.application.create({
    data: {
      studentId: student.id,
      offerId: offer.id,
      status: Status.PEND_EVAL,
    },
  });
}

// Peticiones del alumno internas y externas
async function myRequests(userId) {
  const student = await getStudentFromUser(userId);
  if (!student) {
    return { applications: [], practices: [] };
  }

  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    include: { Offer: true },
    orderBy: { createdAt: "desc" },
  });

  const practices = await prisma.practiceRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return { applications, practices };
}

// pendiente a evaluacion
async function listApplicationsForCoordination() {
  const applications = await prisma.application.findMany({
    where: {
      status: Status.PEND_EVAL,
    },
    include: {
      Offer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return applications;
}

// Cambiar estado de una postulacion interna
async function updateApplicationStatus(applicationId, newStatus) {
  const id = Number(applicationId);

  if (!id) {
    throw new Error("ID de postulación inválido");
  }

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) {
    throw new Error("Postulación no encontrada");
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: newStatus,
    },
  });

  return updated;
}

async function approveApplication(applicationId) {
  return updateApplicationStatus(applicationId, Status.APPROVED);
}

async function rejectApplication(applicationId) {
  return updateApplicationStatus(applicationId, Status.REJECTED);
}

module.exports = {
  getStudentFromUser,
  createApplication,
  myRequests,
  listApplicationsForCoordination,
  approveApplication,
  rejectApplication,
};
