const app = require("../index");
const db = require("../models");
const request = require("supertest");
const moment = require("moment");

describe("API tests", () => {
  let server;

  beforeAll(async () => {
    // await db.sequelize.sync({force: true});
  });

  afterAll(async () => {
    // Close the server and database connections
    // await db.sequelize.close();
  });

  describe("GET /api/scheduling/available-slots", () => {
    it("should return available slots for toda", async () => {
      const response = await request(app)
        .get("/api/scheduling/available-slots")
        .query({ date: "2023-05-03" });
      expect(response.statusCode).toBe(200);
      expect(response.body.available_slots).toBeDefined();
      expect(response.body.available_slots.length).toBeGreaterThan(0);
    });

    it("should return available slots for a specific date", async () => {
      const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
      const response = await request(app).get(
        `/api/scheduling/available-slots?date=${tomorrow}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.available_slots).toBeDefined();
      expect(response.body.available_slots.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/scheduling/book-appointment", () => {
    let service, schedule, user;
    let date = moment().format("YYYY-MM-DD");

    beforeAll(async () => {
      // Create a service, schedule and user
      service = await db.Service.create({
        name: "Test Service",
        slot_duration: 30,
        max_clients_per_slot: 1,
        cleanup_duration: 10,
      });
    });

    beforeEach(async () => {
      // Create a schedule for each test case
      schedule = await db.Schedule.create({
        service_id: service.id,
        day_of_week: moment(date).day(),
        start_time: "10:00",
        end_time: "18:00",
        break_start_time: "12:00:00",
        break_end_time: "13:00:00",
      });

      user = await db.User.create({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
      });
    });

    afterEach(async () => {
      // Clean up the test data after each test case
      await db.Appointment.destroy({ where: {} });
      await db.User.destroy({ where: {} });
      await db.Schedule.destroy({ where: {} });
      await db.User.destroy({ where: {} });
    });

    afterAll(async () => {
      // Clean up the test data after all tests are done
      await db.Service.destroy({ where: {} });
    });

    it("should book an appointment with valid request body", async () => {
      const requestBody = {
        serviceId: service.id,
        scheduleId: schedule.id,
        appointmentDate: date,
        startTime: "10:00",
        endTime: "10:40",
        users: [
          {
            first_name: "John",
            last_name: "Doe",
            email: "johndoe@example.com",
          },
        ],
      };
      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send(requestBody);
      console.log("requestBody", requestBody);
      console.log("response", response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body.appointments).toBeDefined();
      expect(response.body.appointments.length).toBeGreaterThan(0);
    });

    it("should return an error with invalid request body", async () => {
      const requestBody = {
        // missing required fields
      };
      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send(requestBody);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("All fields are required.");
    });

    it("should return an error message when requested slot is outside of working hours", async () => {
      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: date,
          startTime: "09:00",
          endTime: "09:30",
          users: [
            { first_name: "John", last_name: "Doe", email: "john@example.com" },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Requested slot is outside of working hours."
      );
    });

    it("returns an error when the requested slot is fully booked", async () => {
      // Create an appointment to fully book the available slot
      await db.Appointment.create({
        user_id: user.id,
        service_id: service.id,
        schedule_id: schedule.id,
        appointment_date: moment().format("YYYY-MM-DD"),
        start_time: "10:00:00",
        end_time: "10:40:00",
      });

      const startTime = "10:00";
      const endTime = "10:40";

      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: date,
          startTime: startTime,
          endTime: endTime,
          users: [
            {
              first_name: "JohnZ",
              last_name: "Test",
              email: "john@example.com",
            },
          ],
        });

      expect(response.status).toEqual(400);
      expect(response.body.message).toBe("Requested slot is fully booked.");
    });

    it("should return an error when the requested slot is before the current date/time", async () => {
      const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: yesterday,
          startTime: "10:00",
          endTime: "10:40",
          users: [
            {
              first_name: "Jane",
              last_name: "Doe",
              email: "janedoe@example.com",
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Invalid appointment date. You can only book up to 7 days in advance."
      );
    });

    it("should return an error when the requested slot is too far in the future", async () => {
      const futureDate = moment().add(31, "days").format("YYYY-MM-DD");
      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: futureDate,
          startTime: "10:00",
          endTime: "10:40",
          users: [
            {
              first_name: "Jane",
              last_name: "Doe",
              email: "janedoe@example.com",
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid appointment date. You can only book up to 7 days in advance.");
    });
  });
});
