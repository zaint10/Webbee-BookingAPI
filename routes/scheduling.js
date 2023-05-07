const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/scheduling");
const availableSlotController = require("../controllers/available-slots");

// Define the routes
router.get("/available-slots", availableSlotController.getAvailableSlots);
router.post("/book-appointment", bookingController.bookAppointment);

module.exports = router;
