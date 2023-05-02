const express = require("express");
const schedulingRoutes = require("./routes/scheduling");

const app = express();

app.use(express.json());

app.use("/api/scheduling", schedulingRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
