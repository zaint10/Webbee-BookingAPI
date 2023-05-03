const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const { validateRequestedSlot } = require("./helper");
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
              schedule_id: schedule.id,
              service: service.id
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

    console.log('APPPPP')

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
    return res.status(404).json({ message: error.message });
  }
};
