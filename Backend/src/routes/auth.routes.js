const router = require("express").Router();
const { postLogin, createStudent } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

router.post("/auth/login", postLogin);
router.post("/admin/students", requireAuth(["COORDINATION"]), createStudent);

module.exports = router;
