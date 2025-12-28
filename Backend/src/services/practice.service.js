const { prisma } = require("../config/prisma");
const { Status, PracticeStatus } = require("@prisma/client");
const { getStudentFromUser } = require("./application.service");

async function createExternalPractice(userId, payload) {
  const { company, tutorName, tutorEmail, startDate, endDate, details } =
    payload;

  if (!company || !tutorName || !tutorEmail || !startDate || !endDate) {
    throw new Error("Faltan datos obligatorios");
  }

  const student = await getStudentFromUser(userId);
  if (!student) throw new Error("Estudiante no registrado en el sistema");

  return prisma.practiceRequest.create({
    data: {
      studentId: student.id,
      company,
      tutorName,
      tutorEmail,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      details: details || "",
      status: Status.PEND_EVAL,
    },
  });
}

async function listOpenPractices() {
  return prisma.practice.findMany({
    where: { status: PracticeStatus.ABIERTA },
    include: {
      Student: { include: { User: true } },
      Supervisor: true,
      Evaluator: true,
    },
  });
}

async function listExternalPracticeRequests() {
  const requests = await prisma.practiceRequest.findMany({
    include: {
      Student: {
        include: {
          User: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    company: r.company,
    tutorName: r.tutorName,
    tutorEmail: r.tutorEmail,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    student: r.Student
      ? {
          id: r.Student.id,
          career: r.Student.career,
          name: r.Student.User?.name,
          email: r.Student.User?.email,
          rut: r.Student.User?.rut,
        }
      : null,
  }));
}

async function approvePracticeRequest(practiceRequestId) {
  const request = await prisma.practiceRequest.findUnique({
    where: { id: practiceRequestId },
  });

  if (!request) {
    const err = new Error("Solicitud de practica externa no encontrada");
    err.status = 404;
    throw err;
  }

  if (request.status !== Status.PEND_EVAL) {
    const err = new Error("La solicitud ya fue procesada");
    err.status = 400;
    throw err;
  }

  const [practice] = await prisma.$transaction([
    prisma.practice.create({
      data: {
        studentId: request.studentId,
        status: PracticeStatus.ABIERTA,
      },
    }),
    prisma.practiceRequest.update({
      where: { id: practiceRequestId },
      data: { status: Status.APPROVED },
    }),
  ]);

  return practice;
}

async function rejectPracticeRequest(practiceRequestId) {
  const request = await prisma.practiceRequest.findUnique({
    where: { id: practiceRequestId },
  });

  if (!request) {
    const err = new Error("Solicitud de practica externa no encontrada");
    err.status = 404;
    throw err;
  }

  if (request.status !== Status.PEND_EVAL) {
    const err = new Error("La solicitud ya fue procesada");
    err.status = 400;
    throw err;
  }

  const updated = await prisma.practiceRequest.update({
    where: { id: practiceRequestId },
    data: { status: Status.REJECTED },
  });

  return updated;
}

async function closePractice(practiceId) {
  const id = Number(practiceId);
  if (!id) {
    const err = new Error("ID de práctica inválido");
    err.status = 400;
    throw err;
  }

  const practice = await prisma.practice.findUnique({
    where: { id },
  });

  if (!practice) {
    const err = new Error("Práctica no encontrada");
    err.status = 404;
    throw err;
  }

  if (practice.status === PracticeStatus.CERRADA) {
    const err = new Error("La práctica ya está cerrada");
    err.status = 400;
    throw err;
  }

  return prisma.practice.update({
    where: { id },
    data: {
      status: PracticeStatus.CERRADA,
    },
  });
}

module.exports = {
  createExternalPractice,
  listOpenPractices,
  listExternalPracticeRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
  closePractice,
};
