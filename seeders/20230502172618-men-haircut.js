"use strict";

const moment = require("moment-timezone");

const { User, Service, Schedule, Appointment, Holiday } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const thirdDay = moment
      .tz("Asia/Karachi")
      .add(2, "day")
      .format("YYYY-MM-DD");

    // Create Men's Haircut service
    const menHaircut = await Service.create({
      name: "Men Haircut",
      slot_duration: 10,
      max_clients_per_slot: 3,
      cleanup_duration: 5,
    });

    // Create Men's Haircut schedules

    // Define the schedules for the next 7 days, excluding Sunday
    const today = moment.tz("Asia/Karachi");
    const schedules = [];
    for (let i = 0; i < 7; i++) {
      const date = today.clone().add(i, "day");
      if (date.day() === 0) {
        // Skip Sunday
        continue;
      }
      const isHoliday = i === 2;
      if (date.day() === 6) {
        // Saturday schedule
        schedules.push({
          service_id: menHaircut.id,
          day_of_week: date.day(),
          start_time: "10:00",
          end_time: "22:00",
          is_off: isHoliday,
          break_start_time: "15:00",
          break_end_time: "16:00",
        });
      } else {
        schedules.push({
          service_id: menHaircut.id,
          day_of_week: date.day(),
          start_time: "08:00",
          end_time: "20:00",
          is_off: isHoliday,
          break_start_time: "12:00",
          break_end_time: "13:00",
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
    // Delete the Men Haircut service
    await queryInterface.bulkDelete("services", { name: "Men Haircut" }, {});
    await queryInterface.bulkDelete("schedules", { service_id: serviceId });
    await queryInterface.bulkDelete("holidays", { service_id: serviceId });
  },
};
