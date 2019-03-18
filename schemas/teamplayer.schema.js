// load the things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, type) => {
    return sequelize.define('TeamPlayer', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tournamentId: type.INTEGER,
      teamId: type.INTEGER, 
      playerId: type.INTEGER,
      isDelete : type.INTEGER,     
      createdBy:{
        type: type.INTEGER,
        defaultValue :0
      },
      createdDate:{
        type : type.DATE,
        defaultValue : type.fn('NOW')
      }, 
      updatedBy: {
        type: type.INTEGER,
        defaultValue :0
      },
      updatedDate: {
        type : type.DATE,
        defaultValue : type.fn('NOW')
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: 'teamplayer'
    });
  };

