'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('services', {
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('services');
  }
};
