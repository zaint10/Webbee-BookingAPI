"use strict";

const moment = require("moment");
const { User, Service, Schedule, Appointment, Holiday } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const thirdDay = moment(now).add(3, "days").toDate();

    // Create Men's Haircut service
    const menHaircut = await Service.create({
      name: "Men Haircut",
      slot_duration: 10,
      max_clients_per_slot: 3,
      cleanup_duration: 5,
    });

    // Create Men's Haircut schedules
    const daysOfWeek = [
      { day: 1, start: "08:00", end: "20:00" },
      { day: 2, start: "08:00", end: "20:00" },
      { day: 3, start: "08:00", end: "20:00" },
      { day: 4, start: "08:00", end: "20:00" },
      { day: 5, start: "08:00", end: "20:00" },
      { day: 6, start: "10:00", end: "22:00" },
    ];

    const schedules = daysOfWeek.map((day) => ({
      service_id: menHaircut.id,
      day_of_week: day.day,
      start_time: day.start,
      end_time: day.end,
      break_start_time: "12:00",
      break_end_time: "13:00",
      cleaning_break_start_time: "15:00",
      cleaning_break_end_time: "16:00",
    }));

    await Schedule.bulkCreate(schedules);

    // Create public holiday
    await Holiday.create({
      date: thirdDay,
      start_time: "00:00",
      end_time: "23:59",
      service_id: menHaircut.id,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await Holiday.destroy({ truncate: true });
    await Schedule.destroy({ truncate: true });
    await Service.destroy({ truncate: true });
    await Appointment.destroy({ truncate: true });
  },
};
