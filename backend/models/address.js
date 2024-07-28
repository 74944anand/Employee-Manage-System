module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define(
    "address",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tehsil: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      paranoid: true,
      tableName: "address",
    }
  );

  address.associate = function (models) {
    address.belongsTo(models.employee, {
      foreignKey: "employeeId",
      as: "employeeAddress",
    });
  };

  return address;
};
