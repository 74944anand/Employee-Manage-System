module.exports = (sequelize, DataTypes) => {
    const rolePermission = sequelize.define("rolePermission", {
      id: {
        type: DataTypes.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.role,
          key: 'id'
        },
        field: 'role_id',
        allowNull: false
      },
      permissionId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.permission,
          key: 'id'
        },
        field: 'permission_id',
        allowNull: false
      },
    }, {
      freezeTableName: true,
      tableName: 'rolePermission',
      paranoid: true,
      timestamps: true
    });
    rolePermission.associate = function (models) {
      rolePermission.belongsTo(models.role, { foreignKey: 'roleId', as: 'role' })
       rolePermission.belongsTo(models.permission, { through : 'rolePermission',foreignKey: 'permissionId', as: 'permission' })
    };
    return rolePermission;
  };