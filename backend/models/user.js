const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        field: "first_name",
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        field: "username",
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        field: "email",
      },
      password: {
        type: DataTypes.STRING,
        field: "password",
      },
      mobileNumber: {
        type: DataTypes.STRING,
        unique: true,
        field: "mobile_number",
      },
      isEmployee: {
        type: DataTypes.BOOLEAN,
        default: false,
        field: "is_vip",
      },
    },
    {
      freezeTableName: true,
      paranoid: true,
      allowNull: false,
      tableName: "user",
    }
  );
  user.associate = function (models) {
    user.belongsToMany(models.role, { through: models.userRole, as: "role" });
    user.hasMany(models.userRole, { as: "userRole", foreignKey: "userId" });
    user.hasMany(models.employee, { foreignKey: "userId", as: "userEmployee" });
  };

  // This hook is always run before create.
  user.beforeCreate(function (user, options, cb) {
    if (user.password) {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            return err;
          }
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
              return err;
            }
            user.password = hash;
            return resolve(user, options);
          });
        });
      });
    }
  });
  // // This hook is always run before update.
  user.beforeUpdate(function (user, options, cb) {
    if (user.password) {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            return err;
          }
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
              return err;
            }
            user.password = hash;
            return resolve(user, options);
          });
        });
      });
    }
  });

  //Instance method for comparing password.
  user.prototype.comparePassword = function (passw) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
          return reject(err);
        }
        return resolve(isMatch);
      });
    });
  };

  return user;
};
