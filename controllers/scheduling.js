const db = require("../models");
const { Op, fn } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const moment = require("moment");

exports.getAvailableSlots = async (req, res) => {
  try {
    // Retrieve date from query parameter
    const date = req.query.date || moment().format("YYYY-MM-DD");
    const dayOfWeek = moment(date).day();

    // Retrieve all services
    const services = await Service.findAll();

    // Generate list of available slots for each service
    const availableSlots = [];

    for (const service of services) {
      const schedules = await Schedule.findAll({
        where: {
          service_id: service.id,
          day_of_week: dayOfWeek,
          is_off: false,
        },
      });

      const serviceSlots = [];

      for (const schedule of schedules) {
        const start = moment(schedule.start_time, "HH:mm");
        const end = moment(schedule.end_time, "HH:mm");
        const slotDuration = moment.duration(service.slot_duration, "minutes");
        const maxClientsPerSlot = service.max_clients_per_slot;
        const cleanupDuration = moment.duration(
          service.cleanup_duration,
          "minutes"
        );
        const slots = [];

        let current = start.clone();

        while (current.isBefore(end)) {
          const slotStart = current.clone();
          const slotEnd = slotStart
            .clone()
            .add(slotDuration)
            .add(cleanupDuration);
          const appointmentCount = await Appointment.count({
            where: {
              service_id: service.id,
              schedule_id: schedule.id,
              appointment_date: {
                [Op.between]: [
                  moment(date).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                  moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
                ],
              },
              start_time: slotStart.format("HH:mm:ss"),
              end_time: slotEnd.format("HH:mm:ss"),
            },
          });

          if (appointmentCount < maxClientsPerSlot) {
            slots.push({
              start_time: slotStart.format("HH:mm"),
              end_time: slotEnd.format("HH:mm"),
              max_clients: maxClientsPerSlot,
              available_users: maxClientsPerSlot - appointmentCount,
            });
          }

          current.add(slotDuration);
          current.add(cleanupDuration);
        }

        serviceSlots.push({
          day_of_week: schedule.day_of_week,
          slots: slots,
        });
      }

      availableSlots.push({
        service_name: service.name,
        slots: serviceSlots,
      });
    }

    return res.json({
      available_slots: availableSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching schedule data" });
  }
};

const toLocalTimeString = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[1].substring(0, 8);
};

const validateRequestedSlot = async (
  serviceId,
  scheduleId,
  appointmentDate,
  startTime,
  endTime
) => {
  // Check if the schedule exists
  const schedule = await Schedule.findOne({ where: { id: scheduleId } });
  if (!schedule) {
    throw new Error("Invalid schedule ID");
  }

  const service = await Service.findOne({ where: { id: serviceId } });
  if (!service) {
    throw new Error("Invalid service ID");
  }

  // Check if the appointment date is valid
  const today = new Date();
  const maxBookingDays = 7; // configurable number of days
  const maxBookingDate = new Date(
    today.getTime() + maxBookingDays * 24 * 60 * 60 * 1000
  );
  const requestedDate = new Date(appointmentDate);

  if (
    requestedDate.getDate() < today.getDate() ||
    requestedDate > maxBookingDate
  ) {
    throw new Error(
      `Invalid appointment date. You can only book up to ${maxBookingDays} days in advance.`
    );
  }

  // Check if the requested slot falls within the schedule's working hours
  const startDateTime = new Date(`${appointmentDate} ${startTime}`);
  const endDateTime = new Date(`${appointmentDate} ${endTime}`);

  const workingStartDateTime = new Date(
    `${appointmentDate} ${schedule.start_time}`
  );
  const workingEndDateTime = new Date(
    `${appointmentDate} ${schedule.end_time}`
  );

  const breakStartDateTime = new Date(
    `${appointmentDate} ${schedule.break_start_time}`
  );
  const breakEndDateTime = new Date(
    `${appointmentDate} ${schedule.break_end_time}`
  );
  if (
    startDateTime < workingStartDateTime ||
    endDateTime > workingEndDateTime
  ) {
    throw new Error("Requested slot is outside of working hours.");
  }

  // Check if the requested slot falls within the schedule's break time
  if (startDateTime < breakEndDateTime && endDateTime > breakStartDateTime) {
    throw new Error("Requested slot is within a break period.");
  }

  // Convert date-time objects to local time and extract the time portion
  const startTimeString = toLocalTimeString(startDateTime);
  const endTimeString = toLocalTimeString(endDateTime);

  // Check if the requested slot is available
  const existingAppointments = await Appointment.findAll({
    where: {
      schedule_id: scheduleId,
      appointment_date: moment(appointmentDate),
      start_time: {
        [Op.lt]: endTimeString,
      },
      end_time: {
        [Op.gt]: startTimeString,
      },
    },
  });
  const maxClientsPerSlot = service.max_clients_per_slot
  if (existingAppointments.length >= maxClientsPerSlot) {
    throw new Error("Requested slot is fully booked.");
  }
};

exports.bookAppointment = async (req, res) => {
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

    const validationError = await validateRequestedSlot(
      serviceId,
      scheduleId,
      appointmentDate,
      startTime,
      endTime
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check if users already exist in database, create them if not
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        let existingUser = await User.findOne({ where: { email: user.email } });
        if (!existingUser) {
          existingUser = await User.create(user);
        }
        return existingUser;
      })
    );

    // Create appointments for the users
    const appointments = await Promise.all(
      createdUsers.map(async (user) => {
        const appointment = await Appointment.create({
          service_id: serviceId,
          user_id: user.id,
          schedule_id: scheduleId,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
        });
        return appointment;
      })
    );

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to book appointment." });
  }
};
