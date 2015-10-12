module.exports = function (sequelize, Sequelize) {
    return sequelize.define('User', {
        username: {type: Sequelize.STRING, allowNull: false},
        userid: {type: Sequelize.STRING, defaultValue: 0},
        roleid: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        dubs: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        status: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0}
    }, {
        underscored: true,
        tableName: 'users'
    });
}