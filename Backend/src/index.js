require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient, Status, PracticeStatus, DocumentType, Role } = require("@prisma/client");
const { requireAuth } = require("./auth");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// obtener el usuario
async function getStudentFromUser(userId) {
  return prisma.student.findFirst({ where: { userId } });
}

// ========================
// AUTH
// ========================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Falta correo o contraseña" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no existe" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Contraseña incorrecta" });

    if (user.role === "STUDENT" && !user.enabled) {
      return res.status(403).json({
        error: "Estudiante no habilitado para registrar práctica",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno en login" });
  }
});

// ========================
// ADMIN / COORDINATION: crear estudiante
// ========================
app.post(
  "/api/admin/students",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const { email, password, rut, name, career } = req.body;

    if (!email || !password || !rut || !name || !career) {
      return res.status(400).json({ error: "Faltan datos del estudiante" });
    }

    try {
      const existe = await prisma.user.findUnique({ where: { email } });
      if (existe) {
        return res
          .status(400)
          .json({ error: "Ya existe un usuario con ese correo" });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          rut,
          name,
          password: hash,
          role: Role.STUDENT,
          enabled: true,
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          career,
        },
      });

      res.status(201).json({
        message: "Estudiante creado correctamente",
        userId: user.id,
        studentId: student.id,
      });
    } catch (err) {
      console.error("Error al crear estudiante:", err);
      res.status(500).json({ error: "No se pudo crear el estudiante" });
    }
  }
);

// ========================
// CU-01: listar ofertas (STUDENT)
// ========================
app.get("/api/offers", requireAuth(["STUDENT"]), async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  } catch (err) {
    console.error("Error al listar ofertas:", err);
    res.status(500).json({ error: "No se pudieron cargar las ofertas" });
  }
});

// ========================
// CU-01: postular a oferta
// ========================
app.post("/api/applications", requireAuth(["STUDENT"]), async (req, res) => {
  const { offerId } = req.body;
  if (!offerId)
    return res.status(400).json({ error: "Falta ID de oferta" });

  try {
    const student = await getStudentFromUser(req.user.id);
    if (!student)
      return res
        .status(400)
        .json({ error: "Estudiante no registrado en el sistema" });

    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || !offer.active)
      return res.status(400).json({ error: "Oferta no válida" });

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        offerId: offer.id,
        status: Status.PEND_EVAL,
      },
    });

    res.status(201).json(application);
  } catch (err) {
    console.error("Error al postular:", err);
    res.status(500).json({ error: "No se pudo registrar la postulación" });
  }
});

// ========================
// CU-01: registrar práctica externa
// ========================
app.post("/api/practices", requireAuth(["STUDENT"]), async (req, res) => {
  const { company, tutorName, tutorEmail, startDate, endDate, details } = req.body;

  if (!company || !tutorName || !tutorEmail || !startDate || !endDate) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const student = await getStudentFromUser(req.user.id);
    if (!student)
      return res
        .status(400)
        .json({ error: "Estudiante no registrado en el sistema" });

    const request = await prisma.practiceRequest.create({
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

    res.status(201).json(request);
  } catch (err) {
    console.error("Error al registrar práctica externa:", err);
    res.status(500).json({ error: "No se pudo registrar la práctica externa" });
  }
});

// ========================
// CU-01: mis solicitudes
// ========================
app.get("/api/my/requests", requireAuth(["STUDENT"]), async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user.id);
    if (!student) {
      return res.json({ applications: [], practices: [] });
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

    res.json({ applications, practices });
  } catch (err) {
    console.error("Error al obtener solicitudes:", err);
    res.status(500).json({ error: "No se pudieron cargar las solicitudes" });
  }
});

// ========================
// GESTIÓN: aprobar postulaciones y crear Practice
// ========================
app.post(
  "/api/gestion/applications/:id/approve",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const id = Number(req.params.id);
    try {
      const appData = await prisma.application.findUnique({ where: { id } });
      if (!appData)
        return res.status(404).json({ error: "Postulación no encontrada" });

      const student = await prisma.student.findUnique({
        where: { id: appData.studentId },
      });
      if (!student)
        return res.status(400).json({ error: "Estudiante no válido" });

      await prisma.application.update({
        where: { id },
        data: { status: Status.APPROVED },
      });

      const practice = await prisma.practice.create({
        data: {
          studentId: student.id,
          status: PracticeStatus.ABIERTA,
        },
      });

      res.json({
        message: "Postulación aprobada y práctica creada",
        practice,
      });
    } catch (err) {
      console.error("Error al aprobar postulación:", err);
      res.status(500).json({ error: "Error al aprobar postulación" });
    }
  }
);

app.post(
  "/api/gestion/practice-requests/:id/approve",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const id = Number(req.params.id);
    try {
      const reqData = await prisma.practiceRequest.findUnique({ where: { id } });
      if (!reqData)
        return res.status(404).json({ error: "Solicitud no encontrada" });

      const student = await prisma.student.findUnique({
        where: { id: reqData.studentId },
      });
      if (!student)
        return res.status(400).json({ error: "Estudiante no válido" });

      await prisma.practiceRequest.update({
        where: { id },
        data: { status: Status.APPROVED },
      });

      const practice = await prisma.practice.create({
        data: {
          studentId: student.id,
          status: PracticeStatus.ABIERTA,
        },
      });

      res.json({
        message: "Práctica externa aprobada y creada",
        practice,
      });
    } catch (err) {
      console.error("Error al aprobar práctica externa:", err);
      res.status(500).json({ error: "Error al aprobar práctica externa" });
    }
  }
);

// ========================
// GESTIÓN: listar prácticas abiertas
// ========================
app.get(
  "/api/gestion/practices",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    try {
      const practices = await prisma.practice.findMany({
        where: { status: PracticeStatus.ABIERTA },
        include: {
          Student: { include: { User: true } },
          Supervisor: true,
          Evaluator: true,
        },
      });
      res.json(practices);
    } catch (err) {
      console.error("Error al listar prácticas:", err);
      res.status(500).json({ error: "No se pudieron cargar las prácticas" });
    }
  }
);

// ========================
// GESTIÓN: asignar evaluador / supervisor
// ========================
app.post(
  "/api/gestion/practices/:id/asignar-evaluador",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const id = Number(req.params.id);
    const { evaluatorId } = req.body;

    try {
      const evaluator = await prisma.user.findUnique({ where: { id: evaluatorId } });
      if (!evaluator || evaluator.role !== Role.EVALUATOR) {
        return res.status(400).json({ error: "Evaluador no válido" });
      }

      const practice = await prisma.practice.update({
        where: { id },
        data: { evaluatorId },
      });

      res.json({ message: "Evaluador asignado", practice });
    } catch (err) {
      console.error("Error al asignar evaluador:", err);
      res.status(500).json({ error: "No se pudo asignar evaluador" });
    }
  }
);

app.post(
  "/api/gestion/practices/:id/asignar-supervisor",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const id = Number(req.params.id);
    const { supervisorId } = req.body;

    try {
      const supervisor = await prisma.user.findUnique({ where: { id: supervisorId } });
      if (!supervisor || supervisor.role !== Role.SUPERVISOR) {
        return res.status(400).json({ error: "Supervisor no válido" });
      }

      const practice = await prisma.practice.update({
        where: { id },
        data: { supervisorId },
      });

      res.json({ message: "Supervisor asignado", practice });
    } catch (err) {
      console.error("Error al asignar supervisor:", err);
      res.status(500).json({ error: "No se pudo asignar supervisor" });
    }
  }
);

// ========================
// DOCUMENTOS: informe / bitácora
// ========================
app.post(
  "/api/practices/:id/documentos",
  requireAuth(["STUDENT", "SUPERVISOR"]),
  async (req, res) => {
    const practiceId = Number(req.params.id);
    const { type, url } = req.body;

    if (!Object.values(DocumentType).includes(type) || !url) {
      return res.status(400).json({ error: "Datos de documento inválidos" });
    }

    try {
      const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
      if (!practice)
        return res.status(404).json({ error: "Práctica no encontrada" });

      const doc = await prisma.document.create({
        data: { practiceId, type, url },
      });

      res.status(201).json({ message: "Documento registrado", doc });
    } catch (err) {
      console.error("Error al registrar documento:", err);
      res.status(500).json({ error: "No se pudo registrar el documento" });
    }
  }
);

// ========================
// EVALUACIONES
// ========================
app.post(
  "/api/evaluations/supervisor",
  requireAuth(["SUPERVISOR"]),
  async (req, res) => {
    const { practiceId, score, comments } = req.body;

    try {
      const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
      if (!practice)
        return res.status(404).json({ error: "Práctica no encontrada" });

      const ev = await prisma.evaluation.create({
        data: {
          practiceId,
          evaluatorId: req.user.id,
          role: Role.SUPERVISOR,
          score,
          comments: comments || null,
        },
      });

      res.status(201).json({ message: "Evaluación de supervisor registrada", ev });
    } catch (err) {
      console.error("Error evaluación supervisor:", err);
      res.status(500).json({ error: "No se pudo registrar la evaluación" });
    }
  }
);

app.post(
  "/api/evaluations/evaluator",
  requireAuth(["EVALUATOR"]),
  async (req, res) => {
    const { practiceId, score, comments } = req.body;

    try {
      const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
      if (!practice)
        return res.status(404).json({ error: "Práctica no encontrada" });

      const ev = await prisma.evaluation.create({
        data: {
          practiceId,
          evaluatorId: req.user.id,
          role: Role.EVALUATOR,
          score,
          comments: comments || null,
        },
      });

      res.status(201).json({ message: "Evaluación de profesor registrada", ev });
    } catch (err) {
      console.error("Error evaluación profesor:", err);
      res.status(500).json({ error: "No se pudo registrar la evaluación" });
    }
  }
);

// ========================
// CERRAR PRÁCTICA
// ========================
app.post(
  "/api/gestion/practices/:id/cerrar",
  requireAuth(["COORDINATION"]),
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const practice = await prisma.practice.findUnique({
        where: { id },
        include: {
          Documents: true,
          Evaluations: true,
        },
      });

      if (!practice)
        return res.status(404).json({ error: "Práctica no encontrada" });

      const tieneInforme = practice.Documents.some(
        (d) => d.type === DocumentType.INFORME
      );
      const tieneBitacora = practice.Documents.some(
        (d) => d.type === DocumentType.BITACORA
      );
      const evalSupervisor = practice.Evaluations.some(
        (e) => e.role === Role.SUPERVISOR
      );
      const evalProfesor = practice.Evaluations.some(
        (e) => e.role === Role.EVALUATOR
      );

      if (!tieneInforme || !tieneBitacora || !evalSupervisor || !evalProfesor) {
        return res.status(400).json({
          error:
            "No se puede cerrar: falta informe, bitácora o evaluaciones requeridas",
        });
      }

      const updated = await prisma.practice.update({
        where: { id },
        data: { status: PracticeStatus.CERRADA },
      });

      res.json({
        message: "Práctica cerrada correctamente",
        practice: updated,
      });
    } catch (err) {
      console.error("Error al cerrar práctica:", err);
      res.status(500).json({ error: "No se pudo cerrar la práctica" });
    }
  }
);

// ========================
// INICIO SERVIDOR
// ========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API Backend unificado escuchando en http://localhost:${PORT}`);
});
