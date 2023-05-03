'use strict';

module.exports = {
  up: function up(queryInterface, Sequelize) {
    return regeneratorRuntime.async(function up$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(queryInterface.createTable('Appointments', {
              id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
              },
              user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'users',
                  key: 'id'
                }
              },
              service_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'services',
                  key: 'id'
                }
              },
              schedule_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'schedules',
                  key: 'id'
                }
              },
              appointment_date: {
                type: Sequelize.DATE,
                allowNull: false
              },
              start_time: {
                type: Sequelize.TIME,
                allowNull: false
              },
              end_time: {
                type: Sequelize.TIME,
                allowNull: false
              }
            }));

          case 2:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  down: function down(queryInterface, Sequelize) {
    return regeneratorRuntime.async(function down$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(queryInterface.dropTable('Appointments'));

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
};