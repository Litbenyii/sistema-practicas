const { prisma } = require("../config/prisma");

/**
 * Crea estudiante desde coordinación
 */
async function createStudent(data) {
  const { fullName, rut, email, career } = data;

  const password = rut.replace(/\./g, "").replace("-", "").slice(-6) || "123456";

  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: fullName,
      email,
      password: hashed,
      role: "STUDENT",
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: user.id,
      rut,
      career,
    },
  });

  return { user, student, initialPassword: password };
}

/**
 * Obtiene el estudiante asociado a un userId
 */
async function getStudentByUserId(userId) {
  const student = await prisma.student.findFirst({
    where: { userId },
  });
  return student;
}

module.exports = {
  createStudent,
  getStudentByUserId,
};
