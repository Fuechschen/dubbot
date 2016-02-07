module.exports = function (sequelize, Sequelize) {
    return sequelize.define('user', {
        id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull:false},
        username: {type: Sequelize.STRING, allowNull: false},
        userid: {type: Sequelize.STRING, allowNull: false},
        dubs: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        points: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        last_active: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
        afk: {type: Sequelize.BOOLEAN, defaultValue: false},
        status: {type: Sequelize.BOOLEAN, defaultValue: true},
        warned_for_afk: {type: Sequelize.BOOLEAN, defaultValue: false},
        removed_for_afk: {type: Sequelize.BOOLEAN, defaultValue: false},
        afk_message_enabled: {type: Sequelize.BOOLEAN, defaultValue: false},
        afk_message: {type: Sequelize.STRING, defaultValue: null}
    }, {
        underscored: true,
        tableName: 'users'
    });
};
