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

module.exports = {
  createOfferService,
  listOffersService,
};
