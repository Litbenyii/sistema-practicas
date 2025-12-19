const express = require("express");
const router = express.Router();

const { verifyToken, requireCoordination } = require("../middleware/auth");

const {
  createOfferController,
  listOffersController,
  listExternalRequestsController,
  approveExternalRequestController,
  listApplicationsController,
  approveApplicationController,
  rejectApplicationController,
  createStudentController,
} = require("../controllers/coordination.controller");

router.use(verifyToken);
router.use(requireCoordination);

router.get("/offers", listOffersController);
router.post("/offers", createOfferController);

router.get("/external-requests", listExternalRequestsController);
router.post("/external-requests/:id/approve", approveExternalRequestController);

router.get("/applications", listApplicationsController);
router.post("/applications/:id/approve", approveApplicationController);
router.post("/applications/:id/reject", rejectApplicationController);

router.post("/students", createStudentController);

module.exports = router;
