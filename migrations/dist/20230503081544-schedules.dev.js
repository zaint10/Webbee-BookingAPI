'use strict';

module.exports = {
  up: function up(queryInterface, Sequelize) {
    return regeneratorRuntime.async(function up$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(queryInterface.createTable('schedules', {
              id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
              service_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'services',
                  key: 'id'
                }
              },
              day_of_week: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                  min: 0,
                  max: 6
                }
              },
              start_time: {
                type: Sequelize.TIME,
                allowNull: false
              },
              end_time: {
                type: Sequelize.TIME,
                allowNull: false
              },
              is_off: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
              },
              break_start_time: {
                type: Sequelize.TIME,
                allowNull: true
              },
              break_end_time: {
                type: Sequelize.TIME,
                allowNull: true
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
            return regeneratorRuntime.awrap(queryInterface.dropTable('schedules'));

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
};