'use strict';

module.exports = {
  up: function up(queryInterface, Sequelize) {
    return regeneratorRuntime.async(function up$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(queryInterface.createTable('services', {
              id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
              },
              name: {
                allowNull: false,
                type: Sequelize.STRING
              },
              slot_duration: {
                allowNull: false,
                type: Sequelize.INTEGER
              },
              max_clients_per_slot: {
                allowNull: false,
                type: Sequelize.INTEGER
              },
              cleanup_duration: {
                allowNull: false,
                type: Sequelize.INTEGER
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
            return regeneratorRuntime.awrap(queryInterface.dropTable('services'));

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
};