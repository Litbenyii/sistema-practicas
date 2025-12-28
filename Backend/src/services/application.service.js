const { prisma } = require("../config/prisma");
const { Status, PracticeStatus } = require("@prisma/client");

async function getStudentFromUser(userId) {
  return prisma.student.findFirst({ where: { userId } });
}

async function createApplication(userId, offerId) {
  const parsedOfferId = Number(offerId);

  if (!parsedOfferId) {
    throw new Error("Falta ID de oferta");
  }

  const student = await getStudentFromUser(userId);
  if (!student) {
    throw new Error("Estudiante no registrado en el sistema");
  }

  const hasPractice = await studentHasOpenPractice(student.id);
  if (hasPractice) {
    throw new Error(
      "Ya tienes una práctica activa o aprobada. No puedes postular a otra."
    );
  }

  const offer = await prisma.offer.findUnique({
    where: { id: parsedOfferId },
  });

  if (!offer || !offer.active) {
    throw new Error("Oferta no válida");
  }

  if (offer.deadline && new Date() > offer.deadline) {
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
  const id = Number(applicationId);
  if (!id) {
    throw new Error("ID de postulación inválido");
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error("Postulación no encontrada");
  }

  if (application.status !== Status.PEND_EVAL) {
    throw new Error("La postulación ya fue procesada");
  }

  // verificar práctica activa
  const existingPractice = await prisma.practice.findFirst({
    where: {
      studentId: application.studentId,
      status: PracticeStatus.ABIERTA,
    },
  });

  if (existingPractice) {
    throw new Error(
      "El estudiante ya tiene una práctica activa. No se puede aprobar otra."
    );
  }

  // aprobar postulación + crear práctica
  const [updatedApplication, practice] = await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: { status: Status.APPROVED },
    }),
    prisma.practice.create({
      data: {
        studentId: application.studentId,
        status: PracticeStatus.ABIERTA,
      },
    }),
  ]);

  return {
    application: updatedApplication,
    practice,
  };
}

async function rejectApplication(applicationId) {
  return updateApplicationStatus(applicationId, Status.REJECTED);
}

async function studentHasOpenPractice(studentId) {
  const practice = await prisma.practice.findFirst({
    where: {
      studentId,
      status: PracticeStatus.ABIERTA,
    },
  });

  return !!practice;
}

module.exports = {
  getStudentFromUser,
  createApplication,
  myRequests,
  listApplicationsForCoordination,
  approveApplication,
  rejectApplication,
};
