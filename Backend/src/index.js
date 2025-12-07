const express = require("express");
const cors = require("cors");
const config = require("./config/env"); 

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const coordinationRoutes = require("./routes/coordination.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", studentRoutes);
app.use("/api", coordinationRoutes);

app.listen(config.port, () => {
  console.log(`🚀 API Backend escuchando en http://localhost:${config.port}`);
});
