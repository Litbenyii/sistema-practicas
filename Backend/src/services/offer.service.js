const { prisma } = require("../config/prisma");

async function listActiveOffers() {
  return prisma.offer.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

module.exports = { listActiveOffers };
