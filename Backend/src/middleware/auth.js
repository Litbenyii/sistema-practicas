const jwt = require("jsonwebtoken");
const config  = require("../config/env");

function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const [, token] = header.split(" ");

      if (!token) {
        return res.status(401).json({ error: "Falta token de autenticación" });
      }

      const payload = jwt.verify(token, config.jwtSecret);
      // payload: { id, role, name }
      req.user = payload;

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "No autorizado" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}

module.exports = { requireAuth };
