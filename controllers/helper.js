const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const moment = require("moment");
const { toLocalTimeString } = require("../utils/dateUtils");

const validateRequestedSlot = async (
  serviceId,
  scheduleId,
  appointmentDate,
  startTime,
  endTime
) => {
  // Check if the schedule exists
  const schedule = await Schedule.findOne({ where: { id: scheduleId } });
  if (!schedule) {
    throw new Error("Invalid schedule ID");
  }

  const service = await Service.findOne({ where: { id: serviceId } });
  if (!service) {
    throw new Error("Invalid service ID");
  }

  // Check if the appointment date is valid
  const today = new Date();
  const maxBookingDays = 7; // configurable number of days
  const maxBookingDate = new Date(
    today.getTime() + maxBookingDays * 24 * 60 * 60 * 1000
  );
  const requestedDate = new Date(appointmentDate);

  if (
    requestedDate.getDate() < today.getDate() ||
    requestedDate > maxBookingDate
  ) {
    throw new Error(
      `Invalid appointment date. You can only book up to ${maxBookingDays} days in advance.`
    );
  }

  // Check if the requested slot falls within the schedule's working hours
  // const startDateTime = new Date(`${appointmentDate} ${startTime}`);
  // const endDateTime = new Date(`${appointmentDate} ${endTime}`);

  const startDateTime = new Date(`${appointmentDate}T${startTime}:00.000Z`);
  const endDateTime = new Date(`${appointmentDate}T${endTime}:00.000Z`);

  const workingStartDateTime = new Date(
    `${appointmentDate}T${schedule.start_time}.000Z`
  );
  const workingEndDateTime = new Date(
    `${appointmentDate}T${schedule.end_time}.000Z`
  );

  const breakStartDateTime = new Date(
    `${appointmentDate}T${schedule.break_start_time}.000Z`
  );
  const breakEndDateTime = new Date(
    `${appointmentDate}T${schedule.break_end_time}.000Z`
  );

  console.log(startDateTime, workingStartDateTime, startDateTime < workingStartDateTime)

  if (
    startDateTime < workingStartDateTime ||
    endDateTime > workingEndDateTime
  ) {
    throw new Error("Requested slot is outside of working hours.");
  }

  // Check if the requested slot falls within the schedule's break time
  if (startDateTime < breakEndDateTime && endDateTime > breakStartDateTime) {
    throw new Error("Requested slot is within a break period.");
  }

  // Convert date-time objects to local time and extract the time portion

  // Check if the requested slot is available
  const existingAppointments = await Appointment.findAll({
    where: {
      schedule_id: scheduleId,
      appointment_date: moment(appointmentDate),
      [Op.and]: [
        {
          start_time: {
            [Op.lte]: startDateTime.toISOString().split('T')[1].substring(0, 8),
          },
        },
        {
          end_time: {
            [Op.gt]: startDateTime.toISOString().split('T')[1].substring(0, 8),
          },
        },
      ],
    },
  });
  console.log(existingAppointments.length)
  const maxClientsPerSlot = service.max_clients_per_slot;
  if (existingAppointments.length >= maxClientsPerSlot) {
    throw new Error("Requested slot is fully booked.");
  }
};

module.exports = {
    validateRequestedSlot
  };