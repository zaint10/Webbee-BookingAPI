"use strict";

var moment = require("moment");

var _require = require("../models"),
    User = _require.User,
    Service = _require.Service,
    Schedule = _require.Schedule,
    Appointment = _require.Appointment,
    Holiday = _require.Holiday;
/** @type {import('sequelize-cli').Migration} */


module.exports = {
  up: function up(queryInterface, Sequelize) {
    var now, thirdDay, menHaircut, schedules, i, date, isHoliday;
    return regeneratorRuntime.async(function up$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            now = new Date();
            thirdDay = moment().add(2, "day").format("YYYY-MM-DD"); // Create Men's Haircut service

            _context.next = 4;
            return regeneratorRuntime.awrap(Service.create({
              name: "Men Haircut",
              slot_duration: 10,
              max_clients_per_slot: 3,
              cleanup_duration: 5
            }));

          case 4:
            menHaircut = _context.sent;
            // Create Men's Haircut schedules
            // Define the schedules for the next 7 days, excluding Sunday
            schedules = [];
            i = 0;

          case 7:
            if (!(i < 7)) {
              _context.next = 16;
              break;
            }

            date = moment().add(i, "day");

            if (!(date.day() === 0)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("continue", 13);

          case 11:
            isHoliday = i === 2;

            if (date.day() === 6) {
              // Saturday schedule
              schedules.push({
                service_id: menHaircut.id,
                day_of_week: date.day(),
                start_time: "10:00",
                end_time: "22:00",
                is_off: isHoliday,
                break_start_time: "15:00",
                break_end_time: "16:00"
              });
            } else {
              schedules.push({
                service_id: menHaircut.id,
                day_of_week: date.day(),
                start_time: "08:00",
                end_time: "20:00",
                is_off: isHoliday,
                break_start_time: "12:00",
                break_end_time: "13:00"
              });
            }

          case 13:
            i++;
            _context.next = 7;
            break;

          case 16:
            _context.next = 18;
            return regeneratorRuntime.awrap(Schedule.bulkCreate(schedules));

          case 18:
            _context.next = 20;
            return regeneratorRuntime.awrap(Holiday.create({
              date: thirdDay,
              start_time: "00:00",
              end_time: "23:59",
              service_id: menHaircut.id
            }));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  down: function down(queryInterface, Sequelize) {
    var serviceId;
    return regeneratorRuntime.async(function down$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(queryInterface.sequelize.query("SELECT id FROM services WHERE name = 'Men Haircut'", {
              type: Sequelize.QueryTypes.SELECT
            }));

          case 2:
            serviceId = _context2.sent[0].id;
            _context2.next = 5;
            return regeneratorRuntime.awrap(queryInterface.bulkDelete("services", {
              name: "Men Haircut"
            }, {}));

          case 5:
            _context2.next = 7;
            return regeneratorRuntime.awrap(queryInterface.bulkDelete("schedules", {
              service_id: serviceId
            }));

          case 7:
            _context2.next = 9;
            return regeneratorRuntime.awrap(queryInterface.bulkDelete("holidays", {
              service_id: serviceId
            }));

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
};