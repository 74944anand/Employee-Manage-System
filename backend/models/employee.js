module.exports = (sequelize, DataTypes) => {
  const employee = sequelize.define(
    "employee",
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        allowNull: false,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        field: "department_id",
        allowNull: false,
      },
      isResigned: {
        type: DataTypes.BOOLEAN,
        field: "isResigned",
      },
      designation: {
        type: DataTypes.STRING,
        field: "designation",
      },
      salary: {
        type: DataTypes.FLOAT,
        field: "salary",
      },
    },
    {
      freezeTableName: true,
      paranoid: true,
      tableName: "employee",
    }
  );

  employee.associate = function (models) {
    employee.belongsTo(models.user, {
      foreignKey: "userId",
      as: "userEmployee",
    });
    employee.hasMany(models.address, {
      foreignKey: "employeeId",
      as: "employeeAddress",
    });
  };

  return employee;
};
