const { prisma } = require("../config/prisma");

/**
 * Crear solicitud de práctica externa (estudiante)
 */
async function createPracticeRequest(studentId, payload) {
  const {
    companyName,
    tutorName,
    tutorEmail,
    startDate,
    endDate,
    details,
  } = payload;

  const req = await prisma.practiceRequest.create({
    data: {
      studentId,
      companyName,
      tutorName,
      tutorEmail,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      details: details || "",
      status: "PEND_EVAL",
    },
  });

  return req;
}

/**
 * Listar solicitudes de práctica externa (coordinación)
 */
async function getCoordinatorPracticeRequests() {
  return prisma.practiceRequest.findMany({
    include: {
      student: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Actualizar estado de solicitud externa
 */
async function updatePracticeRequestStatus(id, status) {
  return prisma.practiceRequest.update({
    where: { id },
    data: { status },
  });
}

/**
 * Lista prácticas abiertas (para asignar evaluador)
 */
async function getOpenPractices() {
  return prisma.practice.findMany({
    where: { status: "OPEN" },
    include: {
      student: {
        include: { user: true },
      },
      evaluator: true,
    },
  });
}

/**
 * Lista directorio de evaluadores
 */
async function getEvaluators() {
  return prisma.evaluator.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Asigna evaluador a una práctica
 */
async function assignEvaluatorToPractice(practiceId, evaluatorId) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: {
      evaluatorId,
    },
    include: {
      student: {
        include: { user: true },
      },
      evaluator: true,
    },
  });
}

/**
 * Cierra una práctica (status = CLOSED)
 */
async function closePractice(practiceId) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: { status: "CLOSED" },
  });
}

module.exports = {
  createPracticeRequest,
  getCoordinatorPracticeRequests,
  updatePracticeRequestStatus,
  getOpenPractices,
  getEvaluators,
  assignEvaluatorToPractice,
  closePractice,
};
