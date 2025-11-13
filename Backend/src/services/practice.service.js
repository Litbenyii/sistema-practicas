const { prisma } = require("../config/prisma");
const { Status, PracticeStatus } = require("@prisma/client");
const { getStudentFromUser } = require("./application.service");

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

module.exports = { createExternalPractice, listOpenPractices };
