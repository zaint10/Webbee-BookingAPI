'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("schedules", "cleaning_start_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("schedules", "cleaning_end_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("schedules", "cleaning_start_time");
    await queryInterface.removeColumn("schedules", "cleaning_end_time");
    
  }
};
