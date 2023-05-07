"use strict";

const moment = require("moment");
const { User, Service, Schedule, Appointment, Holiday } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const thirdDay = moment().add(2, "day").format("YYYY-MM-DD");

    // Create Women's Haircut service
    const menHaircut = await Service.create({
      name: "Women Haircut",
      slot_duration: 60,
      max_clients_per_slot: 3,
      cleanup_duration: 10,
    });

    // Create Women's Haircut schedules
    // Define the schedules for the next 7 days, excluding Sunday
    const schedules = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, "day");
      // if (date.day() === 0) {
      //   // Skip Sunday
      //   continue;
      // }
      const isHoliday = i === 3;
      if (date.day() === 6) {
        // Saturday schedule
        schedules.push({
          service_id: menHaircut.id,
          day_of_week: date.day(),
          start_time: "10:00",
          end_time: "22:00",
          is_off: false,
          break_start_time: "12:00",
          break_end_time: "13:00",
        });
      } else {
        schedules.push({
          service_id: menHaircut.id,
          day_of_week: date.day(),
          start_time: "08:00",
          end_time: "20:00",
          is_off: date.day() === 0, // Sunday is off
          break_start_time: "12:00",
          break_end_time: "13:00",
          cleaning_start_time: "15:00",
          cleaning_end_time: "16:00",
        });
      }
    }

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
    // Delete the schedules and holidays for the Men Haircut service
    const serviceId = (
      await queryInterface.sequelize.query(
        `SELECT id FROM services WHERE name = 'Men Haircut'`,
        { type: Sequelize.QueryTypes.SELECT }
      )
    )[0].id;
    // Delete the Women Haircut service
    await queryInterface.bulkDelete("services", { name: "Women Haircut" }, {});
    await queryInterface.bulkDelete("schedules", { service_id: serviceId });
    await queryInterface.bulkDelete("holidays", { service_id: serviceId });
  },
};
