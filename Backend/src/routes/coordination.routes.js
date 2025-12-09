const express = require("express");
const router = express.Router();

const { verifyToken, requireCoordination } = require("../middleware/auth");

const {
  createOfferController,
  listOffersController,
  listExternalRequestsController,
  approveExternalRequestController,
} = require("../controllers/coordination.controller");

router.use(verifyToken);

router.use(requireCoordination);

router.get("/offers", listOffersController);
router.post("/offers", createOfferController);

router.get("/external-requests", listExternalRequestsController);
router.post(
  "/external-requests/:id/approve",
  approveExternalRequestController
);

module.exports = router;
