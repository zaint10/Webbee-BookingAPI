const express = require("express");
const schedulingRoutes = require("./routes/scheduling");

const app = express();

app.use(express.json());

app.use("/api/scheduling", schedulingRoutes);

module.exports = app;
