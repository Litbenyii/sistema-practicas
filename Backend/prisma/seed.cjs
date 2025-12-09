const { PrismaClient, Role, Status } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando tablas básicas...");

  await prisma.evaluation.deleteMany();
  await prisma.document.deleteMany();
  await prisma.practice.deleteMany();
  await prisma.practiceRequest.deleteMany();
  await prisma.application.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.practicaVerano.deleteMany().catch(() => {}); 

  console.log("✅ Tablas limpias.");
  console.log("Enum Role desde Prisma:", Role);

  const adminPassword = await bcrypt.hash("Admin123", 10);
  const studentPassword = await bcrypt.hash("123456", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@uni.cl",
      rut: "11111111-1",
      name: "Coordinador Prácticas",
      password: adminPassword,
      role: Role.COORDINATION,
      enabled: true,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "alumno@uni.cl",
      rut: "22222222-2",
      name: "Alumno Prueba",
      password: studentPassword,
      role: Role.STUDENT,
      enabled: true,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      career: "Ingeniería en Informática",
    },
  });

  const offer = await prisma.offer.create({
    data: {
      title: "Práctica Desarrollador Web",
      company: "Empresa Demo",
      location: "Concepción",
      details: "Práctica 320 horas, stack JS, modalidad híbrida",
      active: true,
      Applications: {
        create: [
          {
            studentId: student.id,
            status: Status.PEND_EVAL,
          },
        ],
      },
    },
  });

  console.log("✅ Seed completado.");
  console.log("   Admin:   admin@uni.cl / Admin123");
  console.log("   Alumno:  alumno@uni.cl / 123456");
  console.log("   Oferta: ", offer.title);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
