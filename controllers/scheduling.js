const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const moment = require("moment");

const calculateAvailableSlots = (
  schedules,
  holidays,
  appointments,
  service
) => {
  const startDate = moment().startOf("day");
  const endDate = moment().add(7, "days").endOf("day");

  const availableSlots = [];

  for (
    let date = startDate.utc();
    date.isBefore(endDate.utc());
    date.add(1, "day")
  ) {
    const dayOfWeek = date.day();
    console.log(dayOfWeek, date);
    const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);

    if (!schedule) {
      continue;
    }

    const isHoliday = holidays.some((h) => moment(h.date).isSame(date, "day"));

    if (isHoliday) {
      continue;
    }

    const startTime = moment(date).set({
      hour: schedule.start_time.split(":")[0],
      minute: schedule.start_time.split(":")[1],
      second: 0,
      millisecond: 0,
    });

    const endTime = moment(date).set({
      hour: schedule.end_time.split(":")[0],
      minute: schedule.end_time.split(":")[1],
      second: 0,
      millisecond: 0,
    });

    for (
      let slotTime = startTime;
      slotTime.isBefore(endTime);
      slotTime.add(service.slot_duration + service.cleanup_duration, "minutes")
    ) {
      const overlappingAppointments = appointments.filter((app) => {
        const appStart = moment(app.start_time);
        const appEnd = moment(app.end_time);
        return (
          appStart.isSame(slotTime) ||
          (appStart.isBefore(slotTime) && appEnd.isAfter(slotTime))
        );
      });

      if (overlappingAppointments.length < service.max_clients_per_slot) {
        availableSlots.push(slotTime.toISOString());
      }
    }
  }

  return availableSlots;
};

exports.getAvailableSlots = async (req, res) => {
  try {
    // Retrieve all services
    const services = await Service.findAll();

    // Generate list of available slots for each service
    const availableSlots = [];

    for (const service of services) {
      const schedules = await Schedule.findAll({
        where: {
          service_id: service.id,
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
          const slotEnd = slotStart.clone().add(slotDuration).add(cleanupDuration);
          const appointmentCount = await Appointment.count({
            where: {
              service_id: service.id,
              schedule_id: schedule.id,
              appointment_date: moment().format("YYYY-MM-DD"),
              start_time: slotStart.format("HH:mm:ss"),
              end_time: slotEnd.format("HH:mm:ss"),
            },
          });

          if (appointmentCount < maxClientsPerSlot) {
            slots.push({
              start_time: slotStart.format("HH:mm"),
              end_time: slotEnd.format("HH:mm"),
              max_clients: maxClientsPerSlot,
              available_clients: maxClientsPerSlot - appointmentCount,
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
  res.json({ success: true, message: "Appointment(s) booked successfully." });
};
