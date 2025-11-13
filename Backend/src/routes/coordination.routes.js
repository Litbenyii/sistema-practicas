const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { getOpenPractices } = require("../controllers/coordination.controller");

router.get("/gestion/practices", requireAuth(["COORDINATION"]), getOpenPractices);

module.exports = router;
