const app = require("../index");
const db = require("../models");
const request = require("supertest");
const moment = require("moment");

describe("API tests", () => {
  let server;

  beforeAll(async () => {
    await db.sequelize.sync();
  });

  afterAll(async () => {
    // Close the server and database connections
    await db.sequelize.close();
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

    beforeAll(async () => {
      // Create a service, schedule and user
      service = await db.Service.create({
        name: "Test Service",
        slot_duration: 30,
        max_clients_per_slot: 1,
        cleanup_duration: 10,
      });

    });

    afterAll(async () => {
      // Clean up the test data
      // await db.Appointment.destroy({ where: {} });
      // await db.Schedule.destroy({ where: {} });
      // await db.Service.destroy({ where: {} });
      // await db.User.destroy({ where: {} });
    });
  

    it("should book an appointment with valid request body", async () => {
      const requestBody = {
        serviceId: 1,
        scheduleId: 1,
        appointmentDate: "2023-05-05",
        startTime: "10:00",
        endTime: "10:15",
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
      schedule = await db.Schedule.create({
        service_id: service.id,
        day_of_week: moment().day(),
        start_time: "10:00",
        end_time: "18:00",
        break_start_time: "12:00:00",
        break_end_time: "13:00:00",
      });

      const response = await request(app)
        .post("/api/scheduling/book-appointment")
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: moment().format("YYYY-MM-DD"),
          startTime: "09:00",
          endTime: "09:30",
          users: [
            { first_name: "John", last_name: "Doe", email: "john@example.com" },
          ],
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Requested slot is outside of working hours."
      );
    });

    it('returns an error when the requested slot is fully booked', async () => {
      schedule = await db.Schedule.create({
        service_id: service.id,
        day_of_week: moment().day(),
        start_time: "09:00:00",
        end_time: "17:00:00",
        is_off: false,
      });

      user = await db.User.create({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
      });

      // Create an appointment to fully book the available slot
      await db.Appointment.create({
        user_id: user.id,
        service_id: service.id,
        schedule_id: schedule.id,
        appointment_date: moment().format("YYYY-MM-DD"),
        start_time: "09:00:00",
        end_time: "09:30:00",
      });
      
      const date = moment().format('YYYY-MM-DD');
      const startTime = '09:00';
      const endTime = '09:30';

      console.log({
        serviceId: service.id,
        scheduleId: schedule.id,
        appointmentDate: date,
        startTime: startTime,
        endTime: endTime,
        users: [{  first_name: "JohnZ", last_name: "Test", email: "john@example.com"  }],
      }, 'ZAINN')
  
      const response = await request(app)
        .post('/api/scheduling/book-appointment')
        .send({
          serviceId: service.id,
          scheduleId: schedule.id,
          appointmentDate: date,
          startTime: startTime,
          endTime: endTime,
          users: [{  first_name: "JohnZ", last_name: "Test", email: "john@example.com"  }],
        });
  
      expect(response.status).toEqual(404);
      expect(response.body.message).toBe(
        "Requested slot is fully booked."
      );
    });
  });
});
