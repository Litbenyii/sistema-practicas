const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const c = require("../controllers/student.controller");

router.get("/offers", requireAuth(["STUDENT"]), c.getOffers);
router.post("/applications", requireAuth(["STUDENT"]), c.postApplication);
router.post("/practices", requireAuth(["STUDENT"]), c.postExternalPractice);
router.get("/my/requests", requireAuth(["STUDENT"]), c.getMyRequests);

module.exports = router;
