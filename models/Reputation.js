module.exports = function (sequelize, Sequelize) {
    return sequelize.define('reputation', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
        user_id: {type: Sequelize.STRING, allowNull: false},
        type: {type: Sequelize.STRING, allowNull: false},
        mod_id: {type: Sequelize.STRING, allowNull: false},
        message: {type: Sequelize.STRING, allowNull: true},
        score: {type: Sequelize.INTEGER, allowNull: false, defaultValue: -1},
        timestamp: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
    }, {
        underscored: true,
        tableName: 'reputation'
    });
};
