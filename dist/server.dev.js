"use strict";

var app = require('./index');

var PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log("server is running on PORT ".concat(PORT));
});