module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Track', {
        name: {type: Sequelize.STRING, allowNull: false},
        fkid: {type: Sequelize.STRING, allowNull: false},
        thumbnail: {type: Sequelize.STRING, allowNull: true},
        type: {type: Sequelize.STRING, allowNull: true},
        songLength: {type: Sequelize.INTEGER, allowNull: true},
        blacklisted: {type: Sequelize.BOOLEAN, defaultValue: 0}
    }, {
        underscored: true,
        tableName: 'tracks'
    });
}