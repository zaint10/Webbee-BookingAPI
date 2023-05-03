"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = require("../models");

var _require = require("sequelize"),
    Op = _require.Op,
    fn = _require.fn;

var User = db.User,
    Service = db.Service,
    Schedule = db.Schedule,
    Holiday = db.Holiday,
    Appointment = db.Appointment;

var moment = require("moment");

exports.getAvailableSlots = function _callee(req, res) {
  var date, dayOfWeek, services, availableSlots, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, service, schedules, serviceSlots, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, schedule, start, end, slotDuration, maxClientsPerSlot, cleanupDuration, slots, current, slotStart, slotEnd, appointmentCount;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // Retrieve date from query parameter
          date = req.query.date || moment().format("YYYY-MM-DD");
          dayOfWeek = moment(date).day(); // Retrieve all services

          _context.next = 5;
          return regeneratorRuntime.awrap(Service.findAll());

        case 5:
          services = _context.sent;
          // Generate list of available slots for each service
          availableSlots = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 10;
          _iterator = services[Symbol.iterator]();

        case 12:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 65;
            break;
          }

          service = _step.value;
          _context.next = 16;
          return regeneratorRuntime.awrap(Schedule.findAll({
            where: {
              service_id: service.id,
              day_of_week: dayOfWeek,
              is_off: false
            }
          }));

        case 16:
          schedules = _context.sent;
          serviceSlots = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 21;
          _iterator2 = schedules[Symbol.iterator]();

        case 23:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 47;
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

        case 32:
          if (!current.isBefore(end)) {
            _context.next = 43;
            break;
          }

          slotStart = current.clone();
          slotEnd = slotStart.clone().add(slotDuration).add(cleanupDuration);
          _context.next = 37;
          return regeneratorRuntime.awrap(Appointment.count({
            where: {
              service_id: service.id,
              schedule_id: schedule.id,
              appointment_date: _defineProperty({}, Op.between, [moment(date).startOf("day").format("YYYY-MM-DD HH:mm:ss"), moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss")]),
              start_time: slotStart.format("HH:mm:ss"),
              end_time: slotEnd.format("HH:mm:ss")
            }
          }));

        case 37:
          appointmentCount = _context.sent;

          if (appointmentCount < maxClientsPerSlot) {
            slots.push({
              start_time: slotStart.format("HH:mm"),
              end_time: slotEnd.format("HH:mm"),
              max_clients: maxClientsPerSlot,
              available_users: maxClientsPerSlot - appointmentCount
            });
          }

          current.add(slotDuration);
          current.add(cleanupDuration);
          _context.next = 32;
          break;

        case 43:
          serviceSlots.push({
            day_of_week: schedule.day_of_week,
            slots: slots
          });

        case 44:
          _iteratorNormalCompletion2 = true;
          _context.next = 23;
          break;

        case 47:
          _context.next = 53;
          break;

        case 49:
          _context.prev = 49;
          _context.t0 = _context["catch"](21);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t0;

        case 53:
          _context.prev = 53;
          _context.prev = 54;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 56:
          _context.prev = 56;

          if (!_didIteratorError2) {
            _context.next = 59;
            break;
          }

          throw _iteratorError2;

        case 59:
          return _context.finish(56);

        case 60:
          return _context.finish(53);

        case 61:
          availableSlots.push({
            service_name: service.name,
            slots: serviceSlots
          });

        case 62:
          _iteratorNormalCompletion = true;
          _context.next = 12;
          break;

        case 65:
          _context.next = 71;
          break;

        case 67:
          _context.prev = 67;
          _context.t1 = _context["catch"](10);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 71:
          _context.prev = 71;
          _context.prev = 72;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 74:
          _context.prev = 74;

          if (!_didIteratorError) {
            _context.next = 77;
            break;
          }

          throw _iteratorError;

        case 77:
          return _context.finish(74);

        case 78:
          return _context.finish(71);

        case 79:
          return _context.abrupt("return", res.json({
            available_slots: availableSlots
          }));

        case 82:
          _context.prev = 82;
          _context.t2 = _context["catch"](0);
          console.log(_context.t2);
          res.status(500).json({
            error: "Error fetching schedule data"
          });

        case 86:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 82], [10, 67, 71, 79], [21, 49, 53, 61], [54,, 56, 60], [72,, 74, 78]]);
};

var toLocalTimeString = function toLocalTimeString(date) {
  var localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[1].substring(0, 8);
};

var validateRequestedSlot = function validateRequestedSlot(serviceId, scheduleId, appointmentDate, startTime, endTime) {
  var schedule, service, today, maxBookingDays, maxBookingDate, requestedDate, startDateTime, endDateTime, workingStartDateTime, workingEndDateTime, breakStartDateTime, breakEndDateTime, startTimeString, endTimeString, existingAppointments, maxClientsPerSlot;
  return regeneratorRuntime.async(function validateRequestedSlot$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Schedule.findOne({
            where: {
              id: scheduleId
            }
          }));

        case 2:
          schedule = _context2.sent;

          if (schedule) {
            _context2.next = 5;
            break;
          }

          throw new Error("Invalid schedule ID");

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(Service.findOne({
            where: {
              id: serviceId
            }
          }));

        case 7:
          service = _context2.sent;

          if (service) {
            _context2.next = 10;
            break;
          }

          throw new Error("Invalid service ID");

        case 10:
          // Check if the appointment date is valid
          today = new Date();
          maxBookingDays = 7; // configurable number of days

          maxBookingDate = new Date(today.getTime() + maxBookingDays * 24 * 60 * 60 * 1000);
          requestedDate = new Date(appointmentDate);

          if (!(requestedDate.getDate() < today.getDate() || requestedDate > maxBookingDate)) {
            _context2.next = 16;
            break;
          }

          throw new Error("Invalid appointment date. You can only book up to ".concat(maxBookingDays, " days in advance."));

        case 16:
          // Check if the requested slot falls within the schedule's working hours
          startDateTime = new Date("".concat(appointmentDate, " ").concat(startTime));
          endDateTime = new Date("".concat(appointmentDate, " ").concat(endTime));
          workingStartDateTime = new Date("".concat(appointmentDate, " ").concat(schedule.start_time));
          workingEndDateTime = new Date("".concat(appointmentDate, " ").concat(schedule.end_time));
          breakStartDateTime = new Date("".concat(appointmentDate, " ").concat(schedule.break_start_time));
          breakEndDateTime = new Date("".concat(appointmentDate, " ").concat(schedule.break_end_time));

          if (!(startDateTime < workingStartDateTime || endDateTime > workingEndDateTime)) {
            _context2.next = 24;
            break;
          }

          throw new Error("Requested slot is outside of working hours.");

        case 24:
          if (!(startDateTime < breakEndDateTime && endDateTime > breakStartDateTime)) {
            _context2.next = 26;
            break;
          }

          throw new Error("Requested slot is within a break period.");

        case 26:
          // Convert date-time objects to local time and extract the time portion
          startTimeString = toLocalTimeString(startDateTime);
          endTimeString = toLocalTimeString(endDateTime); // Check if the requested slot is available

          _context2.next = 30;
          return regeneratorRuntime.awrap(Appointment.findAll({
            where: {
              schedule_id: scheduleId,
              appointment_date: moment(appointmentDate),
              start_time: _defineProperty({}, Op.lt, endTimeString),
              end_time: _defineProperty({}, Op.gt, startTimeString)
            }
          }));

        case 30:
          existingAppointments = _context2.sent;
          maxClientsPerSlot = service.max_clients_per_slot;

          if (!(existingAppointments.length >= maxClientsPerSlot)) {
            _context2.next = 34;
            break;
          }

          throw new Error("Requested slot is fully booked.");

        case 34:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.bookAppointment = function _callee4(req, res) {
  var _req$body, serviceId, scheduleId, appointmentDate, startTime, endTime, users, validationError, createdUsers, appointments;

  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _req$body = req.body, serviceId = _req$body.serviceId, scheduleId = _req$body.scheduleId, appointmentDate = _req$body.appointmentDate, startTime = _req$body.startTime, endTime = _req$body.endTime, users = _req$body.users; // Validate request body

          if (!(!serviceId || !scheduleId || !appointmentDate || !startTime || !endTime || !users || users.length === 0)) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "All fields are required."
          }));

        case 4:
          _context5.next = 6;
          return regeneratorRuntime.awrap(validateRequestedSlot(serviceId, scheduleId, appointmentDate, startTime, endTime));

        case 6:
          validationError = _context5.sent;

          if (!validationError) {
            _context5.next = 9;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            error: validationError
          }));

        case 9:
          _context5.next = 11;
          return regeneratorRuntime.awrap(Promise.all(users.map(function _callee2(user) {
            var existingUser;
            return regeneratorRuntime.async(function _callee2$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(User.findOne({
                      where: {
                        email: user.email
                      }
                    }));

                  case 2:
                    existingUser = _context3.sent;

                    if (existingUser) {
                      _context3.next = 7;
                      break;
                    }

                    _context3.next = 6;
                    return regeneratorRuntime.awrap(User.create(user));

                  case 6:
                    existingUser = _context3.sent;

                  case 7:
                    return _context3.abrupt("return", existingUser);

                  case 8:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          })));

        case 11:
          createdUsers = _context5.sent;
          _context5.next = 14;
          return regeneratorRuntime.awrap(Promise.all(createdUsers.map(function _callee3(user) {
            var appointment;
            return regeneratorRuntime.async(function _callee3$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap(Appointment.create({
                      service_id: serviceId,
                      user_id: user.id,
                      schedule_id: scheduleId,
                      appointment_date: appointmentDate,
                      start_time: startTime,
                      end_time: endTime
                    }));

                  case 2:
                    appointment = _context4.sent;
                    return _context4.abrupt("return", appointment);

                  case 4:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          })));

        case 14:
          appointments = _context5.sent;
          res.status(201).json({
            message: "Appointment booked successfully!",
            appointments: appointments
          });
          _context5.next = 22;
          break;

        case 18:
          _context5.prev = 18;
          _context5.t0 = _context5["catch"](0);
          console.log(_context5.t0);
          return _context5.abrupt("return", res.status(500).json({
            message: "Failed to book appointment."
          }));

        case 22:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 18]]);
};