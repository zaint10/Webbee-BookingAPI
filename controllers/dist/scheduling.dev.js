"use strict";

var db = require("../models");

var _require = require("sequelize"),
    Op = _require.Op;

var User = db.User,
    Service = db.Service,
    Schedule = db.Schedule,
    Holiday = db.Holiday,
    Appointment = db.Appointment;

var moment = require("moment");

var calculateAvailableSlots = function calculateAvailableSlots(schedules, holidays, appointments, service) {
  var startDate = moment().startOf("day");
  var endDate = moment().add(7, "days").endOf("day");
  var availableSlots = [];

  var _loop = function _loop(date) {
    var dayOfWeek = date.day();
    console.log(dayOfWeek, date);
    var schedule = schedules.find(function (s) {
      return s.day_of_week === dayOfWeek;
    });

    if (!schedule) {
      return "continue";
    }

    var isHoliday = holidays.some(function (h) {
      return moment(h.date).isSame(date, "day");
    });

    if (isHoliday) {
      return "continue";
    }

    var startTime = moment(date).set({
      hour: schedule.start_time.split(":")[0],
      minute: schedule.start_time.split(":")[1],
      second: 0,
      millisecond: 0
    });
    var endTime = moment(date).set({
      hour: schedule.end_time.split(":")[0],
      minute: schedule.end_time.split(":")[1],
      second: 0,
      millisecond: 0
    });

    var _loop2 = function _loop2(slotTime) {
      var overlappingAppointments = appointments.filter(function (app) {
        var appStart = moment(app.start_time);
        var appEnd = moment(app.end_time);
        return appStart.isSame(slotTime) || appStart.isBefore(slotTime) && appEnd.isAfter(slotTime);
      });

      if (overlappingAppointments.length < service.max_clients_per_slot) {
        availableSlots.push(slotTime.toISOString());
      }
    };

    for (var slotTime = startTime; slotTime.isBefore(endTime); slotTime.add(service.slot_duration + service.cleanup_duration, "minutes")) {
      _loop2(slotTime);
    }
  };

  for (var date = startDate.utc(); date.isBefore(endDate.utc()); date.add(1, "day")) {
    var _ret = _loop(date);

    if (_ret === "continue") continue;
  }

  return availableSlots;
};

exports.getAvailableSlots = function _callee(req, res) {
  var services, availableSlots, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, service, schedules, serviceSlots, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, schedule, start, end, slotDuration, maxClientsPerSlot, cleanupDuration, slots, current, slotStart, slotEnd, appointmentCount;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Service.findAll());

        case 3:
          services = _context.sent;
          // Generate list of available slots for each service
          availableSlots = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 8;
          _iterator = services[Symbol.iterator]();

        case 10:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 63;
            break;
          }

          service = _step.value;
          _context.next = 14;
          return regeneratorRuntime.awrap(Schedule.findAll({
            where: {
              service_id: service.id,
              is_off: false
            }
          }));

        case 14:
          schedules = _context.sent;
          serviceSlots = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 19;
          _iterator2 = schedules[Symbol.iterator]();

        case 21:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 45;
            break;
          }

          schedule = _step2.value;
          start = moment(schedule.start_time, "HH:mm");
          end = moment(schedule.end_time, "HH:mm");
          slotDuration = moment.duration(service.slot_duration, "minutes");
          maxClientsPerSlot = service.max_clients_per_slot;
          cleanupDuration = moment.duration(service.cleanup_duration, "minutes");
          slots = [];
          current = start.clone();

        case 30:
          if (!current.isBefore(end)) {
            _context.next = 41;
            break;
          }

          slotStart = current.clone();
          slotEnd = slotStart.clone().add(slotDuration).add(cleanupDuration);
          _context.next = 35;
          return regeneratorRuntime.awrap(Appointment.count({
            where: {
              service_id: service.id,
              schedule_id: schedule.id,
              appointment_date: moment().format("YYYY-MM-DD"),
              start_time: slotStart.format("HH:mm:ss"),
              end_time: slotEnd.format("HH:mm:ss")
            }
          }));

        case 35:
          appointmentCount = _context.sent;

          if (appointmentCount < maxClientsPerSlot) {
            slots.push({
              start_time: slotStart.format("HH:mm"),
              end_time: slotEnd.format("HH:mm"),
              max_clients: maxClientsPerSlot,
              available_clients: maxClientsPerSlot - appointmentCount
            });
          }

          current.add(slotDuration);
          current.add(cleanupDuration);
          _context.next = 30;
          break;

        case 41:
          serviceSlots.push({
            day_of_week: schedule.day_of_week,
            slots: slots
          });

        case 42:
          _iteratorNormalCompletion2 = true;
          _context.next = 21;
          break;

        case 45:
          _context.next = 51;
          break;

        case 47:
          _context.prev = 47;
          _context.t0 = _context["catch"](19);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t0;

        case 51:
          _context.prev = 51;
          _context.prev = 52;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 54:
          _context.prev = 54;

          if (!_didIteratorError2) {
            _context.next = 57;
            break;
          }

          throw _iteratorError2;

        case 57:
          return _context.finish(54);

        case 58:
          return _context.finish(51);

        case 59:
          availableSlots.push({
            service_name: service.name,
            slots: serviceSlots
          });

        case 60:
          _iteratorNormalCompletion = true;
          _context.next = 10;
          break;

        case 63:
          _context.next = 69;
          break;

        case 65:
          _context.prev = 65;
          _context.t1 = _context["catch"](8);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 69:
          _context.prev = 69;
          _context.prev = 70;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 72:
          _context.prev = 72;

          if (!_didIteratorError) {
            _context.next = 75;
            break;
          }

          throw _iteratorError;

        case 75:
          return _context.finish(72);

        case 76:
          return _context.finish(69);

        case 77:
          return _context.abrupt("return", res.json({
            available_slots: availableSlots
          }));

        case 80:
          _context.prev = 80;
          _context.t2 = _context["catch"](0);
          console.log(_context.t2);
          res.status(500).json({
            error: "Error fetching schedule data"
          });

        case 84:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 80], [8, 65, 69, 77], [19, 47, 51, 59], [52,, 54, 58], [70,, 72, 76]]);
};

exports.bookAppointment = function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          res.json({
            success: true,
            message: "Appointment(s) booked successfully."
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
};