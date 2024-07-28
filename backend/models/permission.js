module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define(
    "permission",
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
      },
      actionName: {
        type: DataTypes.STRING,
        field: "action_name",
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        field: "description",
        allowNull: false,
      },
      baseUrl: {
        type: DataTypes.STRING,
        field: "base_url",
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        field: "path",
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        field: "method",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      tableName: "permission",
      paranoid: true,
      timestamps: true,
    }
  );
  permission.associate = function (models) {
    permission.belongsToMany(models.role, { through: models.rolePermission });
  };
  return permission;
};
