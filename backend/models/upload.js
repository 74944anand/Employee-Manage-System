module.exports = (sequelize, DataTypes) => {
  const upload = sequelize.define(
    "upload",
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.user,
          key: "id",
        },
        field: "user_id",
        allowNull: true,
      },
      filename: {
        type: DataTypes.STRING,
        field: "filename",
        allowNull: true,
      },
      mimetype: {
        type: DataTypes.STRING,
        field: "mimetype",
        allowNull: true,
      },
      isCcReceipt: {
        type: DataTypes.BOOLEAN,
        field: "is_cc_receipt",
        defaultValue: false,
        allowNull: true,
      },
      path: {
        type: DataTypes.STRING,
        field: "path",
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        field: "description",
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: "deletedAt",
        defaultValue: null,
      },
    },
    {
      freezeTableName: true,
      tableName: "upload",
      allowNull: false,
      paranoid: true,
    }
  );
  upload.associate = function (models) {
    upload.belongsTo(models.user, { foreignKey: "userId", as: "user" });
  };
  return upload;
};
