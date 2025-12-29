const { prisma } = require("../config/prisma");

/**
 * Crea postulación de un estudiante a una oferta
 */
async function createApplication(studentId, offerId) {
  // Evitar duplicados
  const existing = await prisma.application.findFirst({
    where: { studentId, offerId },
  });

  if (existing) {
    throw new Error("Ya postulaste a esta oferta.");
  }

  const app = await prisma.application.create({
    data: {
      studentId,
      offerId,
      status: "PEND_EVAL",
    },
    include: {
      offer: true,
      student: {
        include: { user: true },
      },
    },
  });

  return app;
}

/**
 * Devuelve las solicitudes del estudiante:
 *  - postulaciones internas a ofertas
 *  - solicitudes de prácticas externas
 */
async function getMyRequests(studentId) {
  const applications = await prisma.application.findMany({
    where: { studentId },
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });

  const practices = await prisma.practiceRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return {
    applications,
    practices,
  };
}

/**
 * Lista postulaciones para coordinación
 */
async function getCoordinatorApplications() {
  return prisma.application.findMany({
    include: {
      offer: true,
      student: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Cambia estado de postulación (APPROVED / REJECTED)
 */
async function updateApplicationStatus(id, status) {
  const app = await prisma.application.update({
    where: { id },
    data: { status },
  });

  return app;
}

module.exports = {
  createApplication,
  getMyRequests,
  getCoordinatorApplications,
  updateApplicationStatus,
};
