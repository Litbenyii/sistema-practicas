const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // el admin
  const coordPass = await bcrypt.hash("Admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@uni.cl" },
    update: {},
    create: {
      email: "admin@uni.cl",
      rut: "11.111.111-1",
      name: "Coordinador Prácticas",
      password: coordPass,
      role: "COORDINATION",
      enabled: true,
    },
  });

  // alumno de prueba
  const studentPass = await bcrypt.hash("123456", 10);

  const studentUser = await prisma.user.upsert({
    where: { email: "alumno@uni.cl" },
    update: {},
    create: {
      email: "alumno@uni.cl",
      rut: "20.123.456-7",
      name: "Alumno Prueba",
      password: studentPass,
      role: "STUDENT",
      enabled: true,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      career: "Ingeniería en Software",
    },
  });

  // practica de prueba
  await prisma.offer.upsert({
    where: { id: 1 },
    update: { active: true },
    create: {
      title: "Práctica Desarrollador Web",
      company: "Empresa Demo",
      location: "Concepción",
      details: "320 horas, Stack JS, modalidad hibrida",
      active: true,
    },
  });

  console.log("✅ Seed ejecutado correctamente (coord + alumno + oferta)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
