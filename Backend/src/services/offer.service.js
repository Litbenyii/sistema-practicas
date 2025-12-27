const { prisma } = require("../config/prisma");

async function createOfferService({ title, company, location, hours, modality, details, deadline }) {

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
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return offer;
}

async function listOffersService() {
  const now = new Date();

  const offers = await prisma.offer.findMany({
    where: { active: true, OR: [{ deadline: null },{ deadline: { gte: now } }], }, // sin fecha limite o con fecha limite
    orderBy: { createdAt: "desc" },
  });

  return offers;
}

async function deactivateOfferService(offerId) {
  const id = Number(offerId);

  if (!id) {
    throw new Error("ID de oferta inválido");
  }

  const offer = await prisma.offer.findUnique({ where: { id } });

  if (!offer) {
    throw new Error("Oferta no encontrada");
  }

  if (!offer.active) {
    return offer;
  }

  const updated = await prisma.offer.update({
    where: { id },
    data: {
      active: false,
    },
  });

  return updated;
}

module.exports = {
  createOfferService,
  listOffersService,
  deactivateOfferService,
};
