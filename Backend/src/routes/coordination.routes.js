const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const {
  getOpenPractices,
  getPracticeRequests,
  postApprovePracticeRequest,
  postOffer,
} = require("../controllers/coordination.controller");

router.get(
  "/gestion/practices",
  requireAuth(["COORDINATION"]),
  getOpenPractices
);

router.get(
  "/gestion/practice-requests",
  requireAuth(["COORDINATION"]),
  getPracticeRequests
);

router.post(
  "/gestion/practice-requests/:id/approve",
  requireAuth(["COORDINATION"]),
  postApprovePracticeRequest
);

router.post("/offers", requireAuth(["COORDINATION"]), postOffer);

module.exports = router;
