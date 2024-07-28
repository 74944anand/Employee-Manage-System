module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define("role", {
      id: {
        type: DataTypes.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true,
      },
      roleName:{
        type: DataTypes.STRING,
        field: 'role_name',
        allowNull: false,
        unique:true
      },
      roleDescription:{
        type: DataTypes.STRING,
        field: 'role_description',
        allowNull: false
      }
    }, {
      freezeTableName:true,
      tableName: 'role',
      paranoid: true,
      timestamps:true
    });
    role.associate = function (models) {
      role.belongsToMany(models.permission,{through:models.rolePermission })
    };
    return role;
  };