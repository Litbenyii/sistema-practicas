const jwt = require("jsonwebtoken");

function requireAuth(rolesPermitidos = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Falta token de autorizacion" });
    }

    try {
      const datos = jwt.verify(token, process.env.JWT_SECRET);

      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(datos.role)) {
        return res.status(403).json({ error: "No tienes permisos para esta accion" });
      }

      req.user = datos;
      next();
    } catch (error) {
      console.error("Error al validar token:", error.message);
      return res.status(401).json({ error: "Token no valido" });
    }
  };
}

module.exports = { requireAuth };
