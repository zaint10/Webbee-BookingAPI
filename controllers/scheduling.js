const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const {
  validateRequestedSlot,
  validateDateString,
  isSlotValid,
} = require("./helper");
const moment = require("moment");

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

    // Validate the date string
    if (!validateDateString(appointmentDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date. Please use the format YYYY-MM-DD." });
    }

    // Validate startTime and endTime format
    const timeFormatRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(startTime) || !timeFormatRegex.test(endTime)) {
      throw new Error(
        "Invalid start or end time format. Please use the format HH:mm."
      );
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}:00.000Z`);
    const endDateTime = new Date(`${appointmentDate}T${endTime}:00.000Z`);

    const {validationError, service, schedule } = await validateRequestedSlot(
      serviceId,
      scheduleId,
      appointmentDate,
      startDateTime,
      endDateTime,
      users
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
        const existingAppointment = await Appointment.findOne({
          where: {
            user_id: user.id,
            appointment_date: {
              [Op.eq]: db.sequelize.fn("DATE", appointmentDate),
            },
            [Op.and]: [
              {
                start_time: {
                  [Op.eq]: startTime,
                },
              },
              {
                end_time: {
                  [Op.eq]: endTime,
                },
              },
            ],
          },
        });
        
        if (!existingAppointment) {
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
        }else {
          return {[user.email]: "Appointment exists for this user." }
        }
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
