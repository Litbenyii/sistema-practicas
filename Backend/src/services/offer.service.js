const { prisma } = require("../config/prisma");

async function createOfferService({ title, company, location, hours, modality, details }) {

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
