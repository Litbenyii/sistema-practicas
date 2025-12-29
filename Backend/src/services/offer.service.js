const { prisma } = require("../config/prisma");

/**
 * Ofertas visibles para estudiantes (solo activas)
 */
async function listActiveOffers() {
  return prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Ofertas para coordinación (todas)
 */
async function listAllOffers() {
  return prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Crear oferta de práctica (coordinación)
 */
async function createOffer(data) {
  const {
    title,
    company,
    location,
    hours,
    modality,
    details,
    deadline,
    startDate,
  } = data;

  const offer = await prisma.offer.create({
    data: {
      title,
      company,
      location,
      hours,
      modality,
      details,
      deadline: deadline ? new Date(deadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      isActive: true,
    },
  });

  return offer;
}

/**
 * Desactivar oferta (coordinación)
 */
async function deactivateOffer(id) {
  return prisma.offer.update({
    where: { id },
    data: { isActive: false },
  });
}

module.exports = {
  listActiveOffers,
  listAllOffers,
  createOffer,
  deactivateOffer,
};
