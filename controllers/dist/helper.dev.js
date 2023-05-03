"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = require("../models");

var _require = require("sequelize"),
    Op = _require.Op;

var User = db.User,
    Service = db.Service,
    Schedule = db.Schedule,
    Holiday = db.Holiday,
    Appointment = db.Appointment;

var moment = require("moment");

var _require2 = require("../utils/dateUtils"),
    toLocalTimeString = _require2.toLocalTimeString;

var validateRequestedSlot = function validateRequestedSlot(serviceId, scheduleId, appointmentDate, startTime, endTime) {
  var schedule, service, today, maxBookingDays, maxBookingDate, requestedDate, startDateTime, endDateTime, workingStartDateTime, workingEndDateTime, breakStartDateTime, breakEndDateTime, startTimeString, endTimeString, existingAppointments, maxClientsPerSlot;
  return regeneratorRuntime.async(function validateRequestedSlot$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Schedule.findOne({
            where: {
              id: scheduleId
            }
          }));

        case 2:
          schedule = _context.sent;

          if (schedule) {
            _context.next = 5;
            break;
          }

          throw new Error("Invalid schedule ID");

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(Service.findOne({
            where: {
              id: serviceId
            }
          }));

        case 7:
          service = _context.sent;

          if (service) {
            _context.next = 10;
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
            _context.next = 16;
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
            _context.next = 24;
            break;
          }

          throw new Error("Requested slot is outside of working hours.");

        case 24:
          if (!(startDateTime < breakEndDateTime && endDateTime > breakStartDateTime)) {
            _context.next = 26;
            break;
          }

          throw new Error("Requested slot is within a break period.");

        case 26:
          // Convert date-time objects to local time and extract the time portion
          startTimeString = toLocalTimeString(startDateTime);
          endTimeString = toLocalTimeString(endDateTime); // Check if the requested slot is available

          _context.next = 30;
          return regeneratorRuntime.awrap(Appointment.findAll({
            where: {
              schedule_id: scheduleId,
              appointment_date: moment(appointmentDate),
              start_time: _defineProperty({}, Op.lt, endTimeString),
              end_time: _defineProperty({}, Op.gt, startTimeString)
            }
          }));

        case 30:
          existingAppointments = _context.sent;
          maxClientsPerSlot = service.max_clients_per_slot;

          if (!(existingAppointments.length >= maxClientsPerSlot)) {
            _context.next = 34;
            break;
          }

          throw new Error("Requested slot is fully booked.");

        case 34:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = {
  validateRequestedSlot: validateRequestedSlot
};