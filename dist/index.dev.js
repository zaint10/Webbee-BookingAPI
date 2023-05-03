"use strict";

var express = require("express");

var schedulingRoutes = require("./routes/scheduling");

var app = express();
app.use(express.json());
app.use("/api/scheduling", schedulingRoutes);
module.exports = app;