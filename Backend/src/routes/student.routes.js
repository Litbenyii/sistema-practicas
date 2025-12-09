const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const { verifyToken, requireStudent } = require("../middleware/auth");

router.use(verifyToken);
router.use(requireStudent);

router.get("/offers", studentController.getOffers);

router.get("/applications", studentController.getApplications);

router.post("/applications/:offerId", studentController.applyToOffer);

router.get(
  "/practice-requests",
  studentController.getPracticeRequests
);

router.post(
  "/practice-requests",
  studentController.createPracticeRequest
);

module.exports = router;
