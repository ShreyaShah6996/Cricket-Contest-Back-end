
module.exports = (sequelize, type) => {
    return sequelize.define('User', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: type.STRING,
      lastName : type.STRING,
      gender: type.INTEGER,      
      email: {
        type : type.STRING,      
        unique : true
      } ,
      password: type.STRING,
      role: {
        type : type.INTEGER,
        defaultValue : 2
      },
      isActive:{
        type : type.BOOLEAN,
        defaultValue : true
      } ,
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
      tableName: 'user'
    });
  };

