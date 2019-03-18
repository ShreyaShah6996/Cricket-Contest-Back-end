// load the things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, type) => {
    return sequelize.define('Player', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: type.STRING,
      lastName : type.STRING,
      dob: type.DATE,
      gender: type.INTEGER,      
      description: type.STRING,
      playerImage: {
        type:type.STRING,
        allowNull:true
      },
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
      },
      isActive: {
        type : type.BOOLEAN,
        defaultValue : true
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: 'player'
    });
  };

