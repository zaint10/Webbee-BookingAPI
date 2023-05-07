const db = require("../models");
const { Op } = require("sequelize");

const { User, Service, Schedule, Holiday, Appointment } = db;

const {
  validateRequestedSlot,
  validateDateString,
  isSlotValid,
} = require("./helper");
const moment = require("moment");




exports.getAvailableSlots = async (req, res) => {
    try {
      // Retrieve date from query parameter
      const date = req.query.date || moment().format("YYYY-MM-DD");
  
      // Validate the date string
      if (!validateDateString(date)) {
        return res
          .status(400)
          .json({ error: "Invalid date. Please use the format YYYY-MM-DD." });
      }
  
      // Retrieve all services
      const services = await Service.findAll();
  
      // Retrieve slots for the next 7 days by default, or as specified by the 'days' parameter
      const days = req.query.days || 7;
      const dates = Array.from({ length: days }, (_, i) =>
        moment(date).add(i, "days").format("YYYY-MM-DD")
      );
  
      // Generate list of available slots for each service and date
      const availableSlots = await Promise.all(
        services.map(async (service) => {
          const slotsByDate = await Promise.all(
            dates.map(async (date) => {
              return await generateAvailableSlotsForService(service, date);
            })
          );
          return {
            service_name: service.name,
            slots_by_date: slotsByDate,
          };
        })
      );
  
      return res.json({
        available_slots: availableSlots,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error fetching schedule data" });
    }
  };

exports.bookAppointment = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      serviceId,
      scheduleId,
      appointmentDate,
      startTime,
      endTime,
      users,
    } = req.body;

    // Validate request body
    if (
      !serviceId ||
      !scheduleId ||
      !appointmentDate ||
      !startTime ||
      !endTime ||
      !users ||
      users.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate the date string
    if (!validateDateString(appointmentDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date. Please use the format YYYY-MM-DD." });
    }

    // Validate startTime and endTime format
    const timeFormatRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(startTime) || !timeFormatRegex.test(endTime)) {
      throw new Error(
        "Invalid start or end time format. Please use the format HH:mm."
      );
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}:00.000Z`);
    const endDateTime = new Date(`${appointmentDate}T${endTime}:00.000Z`);

    const {validationError, service, schedule } = await validateRequestedSlot(
      serviceId,
      scheduleId,
      appointmentDate,
      startDateTime,
      endDateTime,
      users
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check if the requested slot is valid
    if (!isSlotValid(service, schedule, startDateTime, endDateTime)) {
      throw new Error(
        "Invalid slot. The provided slot does not align with the service's slot configuration."
      );
    }

    // Check if users already exist in database, create them if not
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        let existingUser = await User.findOne({ where: { email: user.email } });
        if (!existingUser) {
          existingUser = await User.create(user, { transaction });
        }
        return existingUser;
      })
    );

    // Create appointments for the users
    const appointments = await Promise.all(
      createdUsers.map(async (user) => {
        const existingAppointment = await Appointment.findOne({
          where: {
            user_id: user.id,
            appointment_date: {
              [Op.eq]: db.sequelize.fn("DATE", appointmentDate),
            },
            [Op.and]: [
              {
                start_time: {
                  [Op.eq]: startTime,
                },
              },
              {
                end_time: {
                  [Op.eq]: endTime,
                },
              },
            ],
          },
        });
        
        if (!existingAppointment) {
          const appointment = await Appointment.create(
            {
              service_id: serviceId,
              user_id: user.id,
              schedule_id: scheduleId,
              appointment_date: appointmentDate,
              start_time: startTime,
              end_time: endTime,
            },
            { transaction }
          );
          return appointment;
        }else {
          return {[user.email]: "Appointment exists for this user." }
        }
      })
    );
    await transaction.commit();
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointments,
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(400).json({ message: error.message });
  }
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
