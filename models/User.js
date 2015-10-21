module.exports = function (sequelize, Sequelize) {
    return sequelize.define('User', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true},
        username: {type: Sequelize.STRING, allowNull: false},
        userid: {type: Sequelize.STRING, defaultValue: 0},
        roleid: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        dubs: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        status: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        last_active: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
    }, {
        underscored: true,
        tableName: 'users'
    });
}
