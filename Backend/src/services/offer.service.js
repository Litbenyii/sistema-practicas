const { prisma } = require("../config/prisma");

// Helper para parsear fechas de forma segura
function parseDateOrNull(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {
    let iso = value.trim();

    // Si viene como "dd/mm/yyyy" la convertimos
    const match = iso.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }

    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      // Si Prisma recibe una fecha inválida va a reventar,
      // así que mejor devolvemos null.
      return null;
    }
    return d;
  }

  return null;
}

async function createOfferService({
  title,
  company,
  location,
  hours,
  modality,
  details,
  deadline,
  startDate,
}) {
  const extraLines = [];

  if (hours) {
    extraLines.push(`Horas estimadas: ${hours}`);
  }

  if (modality) {
    extraLines.push(`Modalidad: ${modality}`);
  }

  const description = [details, extraLines.join(" — ")]
    .filter(Boolean)
    .join("\n\n");

  const offer = await prisma.offer.create({
    data: {
      title,
      company,
      location,
      details: description,
      active: true,
      deadline: parseDateOrNull(deadline),
      startDate: parseDateOrNull(startDate),
    },
  });

  return offer;
}

async function listOffersService() {
  const offers = await prisma.offer.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return offers;
}

module.exports = {
  createOfferService,
  listOffersService,
};
