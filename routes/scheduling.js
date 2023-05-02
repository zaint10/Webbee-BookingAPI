const express = require("express");
const router = express.Router();
const schedulingController = require("../controllers/scheduling");

// Define the routes
router.get("/available-slots", schedulingController.getAvailableSlots);
router.post("/book-appointment", schedulingController.bookAppointment);

module.exports = router;
