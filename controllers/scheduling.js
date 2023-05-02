const db = require("../models");

const { User, Service } = db;

exports.getAvailableSlots = async (req, res) => {
  res.json([{}]);
};

exports.bookAppointment = async (req, res) => {
  res.json({ success: true, message: "Appointment(s) booked successfully." });
};
