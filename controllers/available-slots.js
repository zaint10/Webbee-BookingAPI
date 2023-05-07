const db = require("../models");

const { Service } = db;
const {
  validateDateString,
  generateAvailableSlotsForService,
} = require("./helper");
const moment = require("moment");

exports.getAvailableSlots = async (req, res) => {
  try {
    // Retrieve date from query parameter
    const date = req.query.date || moment().format("YYYY-MM-DD");

    // Validate the date string
    if (!validateDateString(date)) {
      return res
        .status(400)
        .json({ error: "Invalid date. Please use the format YYYY-MM-DD." });
    }

    // Retrieve all services
    const services = await Service.findAll();

    // Retrieve slots for the next 7 days by default, or as specified by the 'days' parameter
    const days = req.query.days || 7;
    const dates = Array.from({ length: days }, (_, i) =>
      moment(date).add(i, "days").format("YYYY-MM-DD")
    );

    // Generate list of available slots for each service and date
    const availableSlots = await Promise.all(
      services.map(async (service) => {
        const slotsByDate = await Promise.all(
          dates.map(async (date) => {
            return await generateAvailableSlotsForService(service, date);
          })
        );
        return {
          service_name: service.name,
          slots_by_date: slotsByDate,
        };
      })
    );

    return res.json({
      available_slots: availableSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching schedule data" });
  }
};
