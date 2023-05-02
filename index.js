const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "I am working" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
