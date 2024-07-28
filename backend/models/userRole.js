module.exports = (sequelize, DataTypes) => {
    const userRole = sequelize.define("userRole", {
      id: {
        type: DataTypes.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        unique: false
      },
      roleId:{
        type: DataTypes.INTEGER,
        field: 'role_id',
        unique: false
      }
    }, {
      freezeTableName:true,
      tableName: 'userRole',
      paranoid: true,
      timestamps:true
    });
    userRole.associate = function (models) {
      userRole.belongsTo(models.role, { foreignKey: 'roleId', as: "role" })
       userRole.belongsTo(models.user, { foreignKey: 'userId', as: "user" })


    };
    return userRole;
  };