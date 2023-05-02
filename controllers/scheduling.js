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

  for (let date = startDate; date.isBefore(endDate); date.add(1, "day")) {
    const dayOfWeek = date.day();
    const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);

    if (!schedule) {
      continue;
    }

    const isHoliday = holidays.some((h) => moment(h.date).isSame(date, "day"));

    if (isHoliday) {
      continue;
    }

    const startTime = moment(schedule.start_time, "HH:mm");
    const endTime = moment(schedule.end_time, "HH:mm");

    for (
      let slotTime = moment(date)
        .add(startTime.hour(), "hour")
        .add(startTime.minute(), "minute");
      slotTime.isBefore(
        date.clone().add(endTime.hour(), "hour").add(endTime.minute(), "minute")
      );
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

    const servicesWithAvailableSlots = await Promise.all(
      services.map(async (service) => {
        const serviceSchedules = schedules.filter(
          (s) => s.service_id === service.id
        );
        const serviceHolidays = holidays.filter(
          (h) => h.service_id === service.id
        );
        const serviceAppointments = appointments.filter(
          (a) => a.service_id === service.id
        );

        const availableSlots = calculateAvailableSlots(
          serviceSchedules,
          serviceHolidays,
          serviceAppointments,
          service
        );

        return {
          serviceSchedules,
          service,
          availableSlots,
        };
      })
    );

    res.status(200).json(servicesWithAvailableSlots);
  } catch (error) {
    res.status(500).json({ error: "Error fetching schedule data" });
  }
};

exports.bookAppointment = async (req, res) => {
  res.json({ success: true, message: "Appointment(s) booked successfully." });
};
