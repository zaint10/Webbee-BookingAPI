const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const {
  validateRequestedSlot,
  validateDateString,
  generateAvailableSlotsForService,
  isSlotValid,
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

    // Generate list of available slots for each service
    const availableSlots = await Promise.all(
      services.map(async (service) => {
        return await generateAvailableSlotsForService(service, date);
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

exports.bookAppointment = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      serviceId,
      scheduleId,
      appointmentDate,
      startTime,
      endTime,
      users,
    } = req.body;

    // Validate request body
    if (
      !serviceId ||
      !scheduleId ||
      !appointmentDate ||
      !startTime ||
      !endTime ||
      !users ||
      users.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}:00.000Z`);
    const endDateTime = new Date(`${appointmentDate}T${endTime}:00.000Z`);

    const {validationError, service, schedule } = await validateRequestedSlot(
      serviceId,
      scheduleId,
      appointmentDate,
      startDateTime,
      endDateTime
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check if the requested slot is valid
    if (!isSlotValid(service, schedule, startDateTime, endDateTime)) {
      throw new Error(
        "Invalid slot. The provided slot does not align with the service's slot configuration."
      );
    }

    // Check if users already exist in database, create them if not
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        let existingUser = await User.findOne({ where: { email: user.email } });
        if (!existingUser) {
          existingUser = await User.create(user, { transaction });
        }
        return existingUser;
      })
    );

    // Create appointments for the users
    const appointments = await Promise.all(
      createdUsers.map(async (user) => {
        const appointment = await Appointment.create(
          {
            service_id: serviceId,
            user_id: user.id,
            schedule_id: scheduleId,
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime,
          },
          { transaction }
        );
        return appointment;
      })
    );
    await transaction.commit();
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointments,
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(400).json({ message: error.message });
  }
};
