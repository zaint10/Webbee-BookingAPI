"use strict";

var app = require("../index");

var db = require("../models");

var request = require("supertest");

var moment = require("moment");

describe("API tests", function () {
  var server;
  beforeAll(function _callee() {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(db.sequelize.sync());

          case 2:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  afterAll(function _callee2() {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(db.sequelize.close());

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  describe("GET /api/scheduling/available-slots", function () {
    it("should return available slots for toda", function _callee3() {
      var response;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(request(app).get("/api/scheduling/available-slots").query({
                date: "2023-05-03"
              }));

            case 2:
              response = _context3.sent;
              expect(response.statusCode).toBe(200);
              expect(response.body.available_slots).toBeDefined();
              expect(response.body.available_slots.length).toBeGreaterThan(0);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
    it("should return available slots for a specific date", function _callee4() {
      var tomorrow, response;
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
              _context4.next = 3;
              return regeneratorRuntime.awrap(request(app).get("/api/scheduling/available-slots?date=".concat(tomorrow)));

            case 3:
              response = _context4.sent;
              expect(response.statusCode).toBe(200);
              expect(response.body.available_slots).toBeDefined();
              expect(response.body.available_slots.length).toBeGreaterThan(0);

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
  });
  describe("POST /api/scheduling/book-appointment", function () {
    var service, schedule, user;
    beforeAll(function _callee5() {
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(db.Service.create({
                name: "Test Service",
                slot_duration: 30,
                max_clients_per_slot: 1,
                cleanup_duration: 10
              }));

            case 2:
              service = _context5.sent;

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      });
    });
    afterAll(function _callee6() {
      return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
            case "end":
              return _context6.stop();
          }
        }
      });
    });
    it("should book an appointment with valid request body", function _callee7() {
      var requestBody, response;
      return regeneratorRuntime.async(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              requestBody = {
                serviceId: 1,
                scheduleId: 1,
                appointmentDate: "2023-05-05",
                startTime: "10:00",
                endTime: "10:15",
                users: [{
                  first_name: "John",
                  last_name: "Doe",
                  email: "johndoe@example.com"
                }]
              };
              _context7.next = 3;
              return regeneratorRuntime.awrap(request(app).post("/api/scheduling/book-appointment").send(requestBody));

            case 3:
              response = _context7.sent;
              expect(response.statusCode).toBe(201);
              expect(response.body.appointments).toBeDefined();
              expect(response.body.appointments.length).toBeGreaterThan(0);

            case 7:
            case "end":
              return _context7.stop();
          }
        }
      });
    });
    it("should return an error with invalid request body", function _callee8() {
      var requestBody, response;
      return regeneratorRuntime.async(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              requestBody = {// missing required fields
              };
              _context8.next = 3;
              return regeneratorRuntime.awrap(request(app).post("/api/scheduling/book-appointment").send(requestBody));

            case 3:
              response = _context8.sent;
              expect(response.statusCode).toBe(400);
              expect(response.body.message).toBe("All fields are required.");

            case 6:
            case "end":
              return _context8.stop();
          }
        }
      });
    });
    it("should return an error message when requested slot is outside of working hours", function _callee9() {
      var response;
      return regeneratorRuntime.async(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(db.Schedule.create({
                service_id: service.id,
                day_of_week: moment().day(),
                start_time: "10:00",
                end_time: "18:00",
                break_start_time: "12:00:00",
                break_end_time: "13:00:00"
              }));

            case 2:
              schedule = _context9.sent;
              _context9.next = 5;
              return regeneratorRuntime.awrap(request(app).post("/api/scheduling/book-appointment").send({
                serviceId: service.id,
                scheduleId: schedule.id,
                appointmentDate: moment().format("YYYY-MM-DD"),
                startTime: "09:00",
                endTime: "09:30",
                users: [{
                  first_name: "John",
                  last_name: "Doe",
                  email: "john@example.com"
                }]
              }));

            case 5:
              response = _context9.sent;
              expect(response.statusCode).toBe(404);
              expect(response.body).toHaveProperty("message");
              expect(response.body.message).toBe("Requested slot is outside of working hours.");

            case 9:
            case "end":
              return _context9.stop();
          }
        }
      });
    });
    it('returns an error when the requested slot is fully booked', function _callee10() {
      var date, startTime, endTime, response;
      return regeneratorRuntime.async(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(db.Schedule.create({
                service_id: service.id,
                day_of_week: moment().day(),
                start_time: "09:00:00",
                end_time: "17:00:00",
                is_off: false
              }));

            case 2:
              schedule = _context10.sent;
              _context10.next = 5;
              return regeneratorRuntime.awrap(db.User.create({
                first_name: "Test",
                last_name: "User",
                email: "test@example.com"
              }));

            case 5:
              user = _context10.sent;
              _context10.next = 8;
              return regeneratorRuntime.awrap(db.Appointment.create({
                user_id: user.id,
                service_id: service.id,
                schedule_id: schedule.id,
                appointment_date: moment().format("YYYY-MM-DD"),
                start_time: "09:00:00",
                end_time: "09:30:00"
              }));

            case 8:
              date = moment().format('YYYY-MM-DD');
              startTime = '09:00';
              endTime = '09:30';
              console.log({
                serviceId: service.id,
                scheduleId: schedule.id,
                appointmentDate: date,
                startTime: startTime,
                endTime: endTime,
                users: [{
                  first_name: "JohnZ",
                  last_name: "Test",
                  email: "john@example.com"
                }]
              }, 'ZAINN');
              _context10.next = 14;
              return regeneratorRuntime.awrap(request(app).post('/api/scheduling/book-appointment').send({
                serviceId: service.id,
                scheduleId: schedule.id,
                appointmentDate: date,
                startTime: startTime,
                endTime: endTime,
                users: [{
                  first_name: "JohnZ",
                  last_name: "Test",
                  email: "john@example.com"
                }]
              }));

            case 14:
              response = _context10.sent;
              expect(response.status).toEqual(404);
              expect(response.body.message).toBe("Requested slot is fully booked.");

            case 17:
            case "end":
              return _context10.stop();
          }
        }
      });
    });
  });
});