const { prisma } = require("../config/prisma");

function parseDateOrNull(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {
    let iso = value.trim();

    const match = iso.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }

    const d = new Date(iso);
    if (isNaN(d.getTime())) {
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
      hours: hours || null,
      modality: modality || null,
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

async function deactivateOfferService(offerId) {
  const id = Number(offerId);
  if (!id) {
    const err = new Error("ID de oferta inválido");
    err.status = 400;
    throw err;
  }

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) {
    const err = new Error("Oferta no encontrada");
    err.status = 404;
    throw err;
  }

  if (!offer.active) {

    return offer;
  }

  const updated = await prisma.offer.update({
    where: { id },
    data: { active: false },
  });

  return updated;
}

module.exports = {
  createOfferService,
  listOffersService,
  deactivateOfferService,
};
