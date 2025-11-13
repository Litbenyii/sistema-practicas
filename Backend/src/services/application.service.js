const { prisma } = require("../config/prisma");
const { Status } = require("@prisma/client");

async function getStudentFromUser(userId) {
  return prisma.student.findFirst({ where: { userId } });
}

async function createApplication(userId, offerId) {
  if (!offerId) throw new Error("Falta ID de oferta");

  const student = await getStudentFromUser(userId);
  if (!student) throw new Error("Estudiante no registrado en el sistema");

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || !offer.active) throw new Error("Oferta no válida");

  // (opcional) evitar duplicadas:
  const dup = await prisma.application.findFirst({
    where: { studentId: student.id, offerId: offer.id },
  });
  if (dup) throw new Error("Ya postulaste a esta oferta");

  return prisma.application.create({
    data: {
      studentId: student.id,
      offerId: offer.id,
      status: Status.PEND_EVAL,
    },
  });
}

async function myRequests(userId) {
  const student = await getStudentFromUser(userId);
  if (!student) return { applications: [], practices: [] };

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

module.exports = { getStudentFromUser, createApplication, myRequests };
