
module.exports = (sequelize, DataTypes) => {
    const userToken = sequelize.define('userToken', {
        id: {
            type: DataTypes.INTEGER,
            field: 'id',
            primaryKey: true,
            autoIncrement: true,
        },
        userId:{
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        token :{
          type : DataTypes.STRING,
          field :"token"  
        }
    }, {
        freezeTableName: true,
        paranoid:true,
        allowNull: false,
        tableName: 'userToken'
    });

    userToken.associate = function (models) {
        userToken.belongsTo(models.user,{ foreignKey: 'userId', as: 'user' })
      };

    return userToken;
}