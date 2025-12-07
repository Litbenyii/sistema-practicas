const { prisma } = require("../config/prisma");

async function listActiveOffers() {
  return prisma.offer.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

async function createOffer(payload) {
  const { title, company, location, hours, modality, details } = payload;

  if (!title || !company || !location) {
    const err = new Error("Título, empresa y ubicación son obligatorios");
    err.status = 400;
    throw err;
  }

  return prisma.offer.create({
    data: {
      title,
      company,
      location,
      hours: hours || 320,
      modality: modality || "",
      details: details || "",
      active: true,
    },
  });
}

module.exports = { listActiveOffers, createOffer };
