'use strict';

require('dotenv').config();

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   return queryInterface.bulkInsert('blockchains', [{
    contract: process.env.CONTRACT_ADDRESS,
    hashtag: '',
    zilsPerTweet: '0',
    blocksPerDay: '0',
    blocksPerWeek: '0',
    CurrentDSEpoch: '0',
    CurrentMiniEpoch: '0',
    NumDSBlocks: '0',
    NumTxBlocks: '0',
    createdAt: new Date(),
    updatedAt: new Date()
    }], {}).catch(() => null);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
   return queryInterface.bulkDelete('blockchains', null, {});
  }
};
