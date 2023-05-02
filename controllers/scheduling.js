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

  for (let date = startDate.utc(); date.isBefore(endDate.utc()); date.add(1, "day")) {
    const dayOfWeek = date.day();
    console.log(dayOfWeek, date)
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
    const services = await Service.findAll();
    const schedules = await Schedule.findAll();
    const holidays = await Holiday.findAll();
    const appointments = await Appointment.findAll();

    const schedulesWithAvailableSlots = schedules.reduce((acc, schedule) => {
      const service = services.find((s) => s.id === schedule.service_id);
      const serviceHolidays = holidays.filter(
        (h) => h.service_id === service.id
      );
      const serviceAppointments = appointments.filter(
        (a) => a.service_id === service.id
      );

      const availableSlots = calculateAvailableSlots(
        [schedule],
        serviceHolidays,
        serviceAppointments,
        service
      );

      if (!acc[schedule.id]) {
        acc[schedule.id] = {
          schedule,
          service,
          availableSlots: [],
          serviceHolidays,
        };
      }

      acc[schedule.id].availableSlots.push(...availableSlots);

      return acc;
    }, {});

    res.status(200).json(Object.values(schedulesWithAvailableSlots));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching schedule data" });
  }
};

exports.bookAppointment = async (req, res) => {
  res.json({ success: true, message: "Appointment(s) booked successfully." });
};
