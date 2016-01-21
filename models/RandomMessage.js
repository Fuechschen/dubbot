module.exports = function (sequelize, Sequelize) {
    return sequelize.define('randommessage', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
        message: {type: Sequelize.STRING, allowNull: false},
        status: {type: Sequelize.BOOLEAN, defaultValue: true}
    }, {
        underscored: true,
        tableName: 'randommessages'
    });
};
