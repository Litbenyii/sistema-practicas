const { prisma } = require("../config/prisma");
const { Status, PracticeStatus, Role, DocumentType } = require("@prisma/client");
const { getStudentFromUser } = require("./application.service");

/* =====================================================
   CREAR SOLICITUD DE PRÁCTICA EXTERNA
===================================================== */

async function createExternalPractice(userId, payload) {
  const { company, tutorName, tutorEmail, startDate, endDate, details } = payload;

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

/* =====================================================
   SOLICITUDES DE PRÁCTICA EXTERNA
===================================================== */

async function listExternalPracticeRequests() {
  const requests = await prisma.practiceRequest.findMany({
    include: {
      Student: {
        include: { User: true },
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
    throw new Error("Solicitud de práctica externa no encontrada");
  }

  if (request.status !== Status.PEND_EVAL) {
    throw new Error("La solicitud ya fue procesada");
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
    throw new Error("Solicitud de práctica externa no encontrada");
  }

  if (request.status !== Status.PEND_EVAL) {
    throw new Error("La solicitud ya fue procesada");
  }

  return prisma.practiceRequest.update({
    where: { id: practiceRequestId },
    data: { status: Status.REJECTED },
  });
}

/* =====================================================
   PRÁCTICAS ABIERTAS
===================================================== */

async function listOpenPractices() {
  return prisma.practice.findMany({
    where: { status: PracticeStatus.ABIERTA },
    include: {
      Student: { include: { User: true } },
      Supervisor: true,
      Evaluator: true,
      Documents: true,
      Evaluations: true,
    },
  });
}

/* =====================================================
   EVALUADORES
===================================================== */

// 🔹 Equivale a listEvaluators()
async function listEvaluatorDirectory() {
  return prisma.user.findMany({
    where: {
      role: Role.EVALUATOR,
      enabled: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

// 🔹 Equivale a assignEvaluator()
async function assignEvaluatorToPractice(practiceId, evaluatorId) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: { evaluatorId },
  });
}

/* =====================================================
   VALIDACIÓN DE CIERRE
===================================================== */

async function getPracticeClosureStatus(practiceId) {
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
    include: {
      Documents: true,
      Evaluations: true,
    },
  });

  if (!practice) throw new Error("Práctica no encontrada.");

  const hasInforme = practice.Documents.some(d => d.type === DocumentType.INFORME);
  const hasBitacora = practice.Documents.some(d => d.type === DocumentType.BITACORA);

  const evalSupervisor = practice.Evaluations.find(
    e => e.role === Role.SUPERVISOR && e.score !== null
  );

  const evalEvaluator = practice.Evaluations.find(
    e => e.role === Role.EVALUATOR && e.score !== null
  );

  return {
    isReadyToClose: !!(hasInforme && hasBitacora && evalSupervisor && evalEvaluator),
    checks: {
      informe: hasInforme,
      bitacora: hasBitacora,
      evalSupervisor: !!evalSupervisor,
      evalEvaluator: !!evalEvaluator,
    },
  };
}

/* =====================================================
   CIERRE OFICIAL (equivale a closePractice)
===================================================== */

async function closePracticeOfficial(practiceId) {
  const status = await getPracticeClosureStatus(practiceId);

  if (!status.isReadyToClose) {
    throw new Error("Faltan documentos o evaluaciones para cerrar la práctica.");
  }

  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
    include: { Evaluations: true },
  });

  const evalSup = practice.Evaluations.find(e => e.role === Role.SUPERVISOR);
  const evalEv = practice.Evaluations.find(e => e.role === Role.EVALUATOR);

  const finalGrade = (evalSup.score * 0.5) + (evalEv.score * 0.5);

  return prisma.practice.update({
    where: { id: practiceId },
    data: {
      status: PracticeStatus.CERRADA,
      finalGrade,
      updatedAt: new Date(),
    },
  });
}


module.exports = {
  createExternalPractice,
  listExternalPracticeRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
  listOpenPractices,
  listEvaluatorDirectory,
  assignEvaluatorToPractice,
  getPracticeClosureStatus,
  closePracticeOfficial,
};
