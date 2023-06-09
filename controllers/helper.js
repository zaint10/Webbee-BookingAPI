const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;
const moment = require("moment");
const { toLocalTimeString } = require("../utils/dateUtils");

const validateRequestedSlot = async (
  serviceId,
  scheduleId,
  appointmentDate,
  startDateTime,
  endDateTime,
  users
) => {
  const validationError = undefined;

  const service = await Service.findOne({ where: { id: serviceId } });
  if (!service) {
    throw new Error("Invalid service ID");
  }

  // Check if the appointment date is a public holiday or buisness is closed off
  const isHoliday = await Holiday.findOne({
    where: {
      service_id: service.id,
      date: {
        [Op.eq]: db.sequelize.fn("DATE", appointmentDate),
      },
    },
  });

  if (isHoliday) {
    throw new Error("Appointment date falls on a public holiday");
  }

  // Check if the schedule exists
  const schedule = await Schedule.findOne({ where: { id: scheduleId } });
  if (!schedule) {
    throw new Error("Invalid schedule ID");
  }

  if (schedule.is_off) {
    throw new Error("Business is clossed off.");
  }

  // Check if the appointment date is valid
  const today = new Date();
  const maxBookingDays = 7; // configurable number of days
  const maxBookingDate = new Date(
    today.getTime() + maxBookingDays * 24 * 60 * 60 * 1000
  );
  const requestedDate = new Date(appointmentDate);

  if (
    moment(requestedDate).isBefore(moment(today), "day") ||
    moment(requestedDate).isAfter(moment(maxBookingDate), "day")
  ) {
    throw new Error(
      `Invalid appointment date. You can only book up to ${maxBookingDays} days in advance.`
    );
  }

  // Check if the requested slot falls within the schedule's working hours

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

  if (
    startDateTime < workingStartDateTime ||
    endDateTime > workingEndDateTime
  ) {
    throw new Error("Requested slot is outside of working hours.");
  }

  // Check if the requested slot falls within the schedule's break time or spans accros a break time
  if (
    (startDateTime < breakEndDateTime && endDateTime > breakStartDateTime) ||
    (startDateTime < breakStartDateTime && endDateTime > breakEndDateTime)
  ) {
    throw new Error("Requested slot is within or spans across a break period.");
  }

  // Convert date-time objects to local time and extract the time portion

  // Check if the requested slot is available
  const existingAppointments = await Appointment.findAll({
    where: {
      schedule_id: scheduleId,
      appointment_date: moment(appointmentDate),
      [Op.or]: [
        {
          [Op.and]: [
            {
              start_time: {
                [Op.lte]: startDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
            {
              end_time: {
                [Op.gt]: startDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
          ],
        },
        {
          [Op.and]: [
            {
              start_time: {
                [Op.lt]: endDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
            {
              end_time: {
                [Op.gte]: endDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
          ],
        },
        {
          [Op.and]: [
            {
              start_time: {
                [Op.gte]: startDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
            {
              end_time: {
                [Op.lte]: endDateTime
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 8),
              },
            },
          ],
        },
      ],
    },
  });

  const maxClientsPerSlot = service.max_clients_per_slot;
  if (existingAppointments.length >= maxClientsPerSlot) {
    throw new Error("Requested slot is fully booked.");
  }

  if (users.length >= maxClientsPerSlot) {
    throw new Error("Users cannot be greater than allowed user per slot.");
  }

  
  return { validationError, service, schedule };
};

const validateDateString = (dateString) => {
  // Check if the date string is in the correct format (YYYY-MM-DD)
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormatRegex.test(dateString)) {
    return false;
  }

  // Check if the date string represents a valid date
  const date = moment(dateString, "YYYY-MM-DD");
  if (!date.isValid()) {
    return false;
  }

  return true;
};

const isSlotValid = (service, schedule, startDateTime, endDateTime) => {
  const startTime = moment(startDateTime);
  const endTime = moment(endDateTime);

  const slotDuration = moment
    .duration(service.slot_duration, "minutes")
    .asMilliseconds();
  const cleanupDuration = moment
    .duration(service.cleanup_duration, "minutes")
    .asMilliseconds();
  const timeDifference = endTime.diff(startTime);

  return timeDifference === slotDuration;
};

const generateAvailableSlotsForService = async (service, date) => {
  const dayOfWeek = moment(date).day();
  const schedules = await Schedule.findAll({
    where: {
      service_id: service.id,
      day_of_week: dayOfWeek,
    },
  });

  const serviceSlots = [];

  for (const schedule of schedules) {
    const start = moment(schedule.start_time, "HH:mm");
    const end = moment(schedule.end_time, "HH:mm");
    const slotDuration = moment.duration(service.slot_duration, "minutes");
    const maxClientsPerSlot = service.max_clients_per_slot;
    const cleanupDuration = moment.duration(
      service.cleanup_duration,
      "minutes"
    );
    const slots = [];

    let current = start.clone();

    while (current.isBefore(end)) {
      const slotStart = current.clone();
      const slotEnd = slotStart.clone().add(slotDuration);

      // Check if the slot is not a break, is not off, and is not a holiday
      const isBreak = current.isSameOrAfter(
        moment(schedule.break_start_time, "HH:mm")
      ) && current.isBefore(moment(schedule.break_end_time, "HH:mm"));

      const isOff = schedule.is_off;
      
      const isHoliday = await Holiday.findOne({
        where: {
          service_id: service.id,
          date: {
            [Op.eq]: db.sequelize.fn("DATE", date),
          },
        },
      });

      if (!isBreak && !isOff && !isHoliday) {
        const appointmentCount = await Appointment.count({
          where: {
            service_id: service.id,
            schedule_id: schedule.id,
            appointment_date: {
              [Op.between]: [
                moment(date).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
              ],
            },
            start_time: slotStart.format("HH:mm:ss"),
            end_time: slotEnd.format("HH:mm:ss"),
          },
        });

        if (appointmentCount < maxClientsPerSlot) {
          let dateTimeString = `${date}T${slotStart.format("HH:mm")}:00.000Z`;
          const start_datetime = new Date(dateTimeString).toISOString();
          dateTimeString = `${date}T${slotEnd.format("HH:mm")}:00.000Z`;
          const end_datetime = new Date(dateTimeString).toISOString();
          slots.push({
            start_datetime: start_datetime,
            end_datetime: end_datetime,
            max_clients: maxClientsPerSlot,
            available_users: maxClientsPerSlot - appointmentCount,
            schedule_id: schedule.id,
            service: service.id,
          });
        }
      }

      current.add(slotDuration);
      current.add(cleanupDuration);
    }

    if (slots.length > 0) {
      serviceSlots.push({
        day_of_week: schedule.day_of_week,
        slots: slots,
      });
    }
  }

  return {
    service_name: service.name,
    slots: serviceSlots,
  };
};


module.exports = {
  validateRequestedSlot,
  validateDateString,
  isSlotValid,
  generateAvailableSlotsForService,
};
