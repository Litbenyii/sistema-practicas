const express = require("express");
const router = express.Router();

// Middleware de seguridad
const { verifyToken, requireCoordination } = require("../middleware/auth");

// Importación de todos los controladores unificados
const {
  createOfferController,
  listOffersController,
  deactivateOfferController,
  createStudentController,
  listExternalRequestsController,
  approveExternalRequestController,
  rejectExternalRequestController,
  listApplicationsController,
  approveApplicationController,
  rejectApplicationController,
  listEvaluatorsController,
  listOpenPracticesController,
  assignEvaluatorController,
  closePracticeController,
} = require("../controllers/coordination.controller");

router.use(verifyToken);
router.use(requireCoordination);

router.get("/offers", listOffersController);
router.post("/offers", createOfferController);
router.post("/offers/:id/deactivate", deactivateOfferController);

router.get("/external-requests", listExternalRequestsController);
router.post("/external-requests/:id/approve", approveExternalRequestController);
router.post("/external-requests/:id/reject", rejectExternalRequestController);

router.get("/applications", listApplicationsController);
router.post("/applications/:id/approve", approveApplicationController);
router.post("/applications/:id/reject", rejectApplicationController);

router.post("/students", createStudentController);

router.get("/evaluators", listEvaluatorsController);

router.get("/practices/open", listOpenPracticesController);
router.post("/practices/assign-evaluator", assignEvaluatorController);
router.post("/practices/:id/close", closePracticeController);

module.exports = router;