'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedules');
  }
};
